import { Controller, Get, Query } from '@nestjs/common';

import { Public } from 'apps/sem-api/src/common/decorator/public';
import { RankingType } from 'apps/sem-api/src/common/enum';
import { AwardCheckInfoEntity } from 'apps/sem-api/src/entity/award.check';
import { RankingResultEntity } from 'apps/sem-api/src/entity/ranking.result.entity';
import { getRepository } from 'typeorm';
import { StatisticService } from './statistic.service';
import { RankingRuleEntity } from 'apps/sem-api/src/entity/ranking.config.entity';
import { AwardSendLogQueryDto, RankingQueryDto } from './dto';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statiService: StatisticService) {}
  @Get('index')
  @Public()
  async index() {
    return {
      awardCnt: await this.statiService.getAwardCnt(),
      activityCnt: await this.statiService.getActivicyCnt(),
      taskCnt: await this.statiService.getTaskCnt(),
      targetCnt: await this.statiService.getTargetCnt(),
    };
  }
  //统计单个活动，奖励发送的数量
  // @Public()
  @Get('/award/sendlog')


  async awardlog(@Query() qs: AwardSendLogQueryDto) {
    const { id, create_at } = qs;
    if (!id || create_at?.length != 2) {
      return [];
    }
    const qb = getRepository(AwardCheckInfoEntity)
      .createQueryBuilder('t1')
      .leftJoinAndSelect('t1.completeUser', 'user')
      .leftJoinAndSelect('t1.awardInstance', 'award')
      .leftJoinAndSelect('award.award', 'src')
      .where(
        'user.activity = :actId and t1.create_at >= :stime and t1.create_at <= :etime',
        {
          actId: id,
          stime: create_at[0] + ' 00:00:00',
          etime: create_at[1] + ' 23:59:59',
        }
      )
      .groupBy(
        'DATE_FORMAT(t1.create_at,"%Y-%m-%d"),src.name,src.key_id,src.key_type'
      )
      .select('sum(t1.award_number)', 'value')
      .addSelect('sum(if(award.days, award.days, t1.award_days))', 'days')
      .addSelect('src.name', 'name')
      // .addSelect('src.key_id')
      // .addSelect('src.key_type')
      .addSelect(['DATE_FORMAT(t1.create_at,"%Y-%m-%d") as day']);
    const result = await qb.getRawMany();
    return result;
  }

  @Get('/ranking')
  // @Public()




  async ranking(@Query() qs: RankingQueryDto) {
    const { create_at, id, actId } = qs;
    const ruleInfo = await getRepository(RankingRuleEntity)
      .createQueryBuilder('t1')
      .where('t1.id = :id', {
        id,
      })
      .getOne();
    const qb = getRepository(RankingResultEntity)
      .createQueryBuilder('t1')
      .leftJoinAndSelect('t1.rankingRule', 'rule')
      .andWhere('t1.ranking_rule_id = :ruleId and rule.activity = :actId ', {
        ruleId: id,
        actId: actId,
      })
      .select(['t1.bus_user_id', 't1.period_key'])
      .addSelect('t1.amount', 'value')
      .orderBy(
        't1.amount',
        ruleInfo?.customParam?.rankOrder?.toUpperCase() || 'DESC'
      )
      .addOrderBy('t1.last_time', 'ASC');
    if (qs.period != RankingType.Total) {
      qb.andWhere('t1.create_at >= :stime and t1.create_at <= :etime', {
        stime: create_at[0] + ' 00:00:00',
        etime: create_at[1] + ' 23:59:59',
      });
    }
    const result = await qb.getRawMany();
    return result;
  }
}
