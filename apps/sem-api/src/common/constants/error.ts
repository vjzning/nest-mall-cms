class CodeAndMsg {
  CODE: number;
  MESSAGE: string;
}
export class ErrorCode {
  static readonly SUCCESS: CodeAndMsg = { CODE: 0, MESSAGE: 'success' };
  static readonly ERROR: CodeAndMsg = { CODE: 1, MESSAGE: 'fail' };
  static readonly ParamsError: CodeAndMsg = { CODE: 2, MESSAGE: '参数错误' };

  static readonly Forbidden: CodeAndMsg = {
    CODE: 403,
    MESSAGE: '没有权限执行此操作',
  };
  static readonly NotFound: CodeAndMsg = {
    CODE: 404,
    MESSAGE: '找不到请求的资源',
  };

  static readonly LoginError: CodeAndMsg = {
    CODE: 1000,
    MESSAGE: '用户名或密码错误',
  };

  static readonly LoginTimeout: CodeAndMsg = {
    CODE: 1001,
    MESSAGE: '登录超时',
  };
  static readonly InActive: CodeAndMsg = { CODE: 1002, MESSAGE: '账号未激活' };

  static readonly TokenError: CodeAndMsg = { CODE: 1003, MESSAGE: 'token错误' };

  static readonly UserNameExists: CodeAndMsg = {
    CODE: 1004,
    MESSAGE: ' 用户名已存在',
  };

  static readonly UserNoExists: CodeAndMsg = {
    CODE: 1005,
    MESSAGE: '用户不存在',
  };

  static readonly PASSWORDNEQ: CodeAndMsg = {
    CODE: 1006,
    MESSAGE: '密码不一致',
  };

  static readonly NotAwarDNotSend: CodeAndMsg = {
    CODE: 1007,
    MESSAGE: '暂无奖励需要发送',
  };

  static readonly NotTaskInstanceNotFound: CodeAndMsg = {
    CODE: 1008,
    MESSAGE: '任务实例不存在',
  };

  static readonly TaskNotCall: CodeAndMsg = {
    CODE: 1009,
    MESSAGE: '任务不能被调用',
  };

  static readonly DeployIng: CodeAndMsg = {
    CODE: 1010,
    MESSAGE: '正在部署中',
  };

  static readonly NotTargetNotFound: CodeAndMsg = {
    CODE: 1011,
    MESSAGE: '指标未找到',
  };

  static readonly ActivityOffLine: CodeAndMsg = {
    CODE: 1012,
    MESSAGE: '活动已下线或已结束',
  };
  static readonly InvalidRedirectUrl: CodeAndMsg = {
    CODE: 1013,
    MESSAGE: '无效的redirect_url',
  };
  static readonly ActNotFound: CodeAndMsg = {
    CODE: 1014,
    MESSAGE: '活动不存在，可能已经被删除！',
  };

  static readonly GETAWARDFAIL: CodeAndMsg = {
    CODE: 1015,
    MESSAGE: '奖励领取失败',
  };

  static readonly ActNotOpen: CodeAndMsg = {
    CODE: 1016,
    MESSAGE: '活动未开放',
  };

  static readonly TaskNotOpen: CodeAndMsg = {
    CODE: 1017,
    MESSAGE: '任务未开放',
  };

  static readonly MaxNumCall: CodeAndMsg = {
    CODE: 1018,
    MESSAGE: '超过最大调用次数',
  };

  static readonly ACTNOTEXISTS: CodeAndMsg = {
    CODE: 1019,
    MESSAGE: '超过最大调用次数',
  };

  static readonly AwardNoCheck: CodeAndMsg = {
    CODE: 1020,
    MESSAGE: '存在未审核奖励',
  };

  static readonly NotCondition: CodeAndMsg = {
    CODE: 1021,
    MESSAGE: '条件ID不存在',
  };
  static readonly InvalidCode: CodeAndMsg = {
    CODE: 9999,
    MESSAGE: '无效的code',
  };
  static readonly InvalidAppid: CodeAndMsg = {
    CODE: 9998,
    MESSAGE: '无效的appid',
  };
  static readonly InvalidSecret: CodeAndMsg = {
    CODE: 9997,
    MESSAGE: '无效的secret',
  };
  static CodeToMessage(code: number): string {
    for (const key of Object.keys(this)) {
      if (this[key].CODE === code) {
        return this[key].MESSAGE;
      }
    }
    return '';
  }

  static HasCode(code: number): boolean {
    for (const key of Object.keys(this)) {
      if (this[key].CODE === code) {
        return true;
      }
    }
    return false;
  }
}
