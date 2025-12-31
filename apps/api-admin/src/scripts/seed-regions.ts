async function seed() {
    const CDN_URL = 'https://unpkg.com/province-city-china/dist/data.json';
    const API_URL = 'http://localhost:3000/system/region/init'; // 请确保 api-admin 已启动

    console.log('正在从 CDN 获取数据...');
    try {
        const response = await fetch(CDN_URL);
        if (!response.ok) {
            throw new Error(`获取数据失败: ${response.statusText}`);
        }
        const rawData: any = await response.json();

        console.log(`获取到 ${rawData.length} 条原始数据，正在转换格式...`);

        const regions = rawData.map((item: any) => {
            let level = 1;
            let parentCode: string | null = null;

            if (item.city !== 0 && item.area === 0) {
                level = 2;
                parentCode = `${item.province}0000`;
            } else if (item.area !== 0) {
                level = 3;
                parentCode = `${item.province}${item.city}00`;
            }

            return {
                name: item.name,
                code: item.code,
                parentCode,
                level,
            };
        });

        console.log('正在分批同步到数据库...');
        const batchSize = 1000;
        let successCount = 0;

        for (let i = 0; i < regions.length; i += batchSize) {
            const batch = regions.slice(i, i + batchSize);
            const postResponse = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(batch),
            });

            if (!postResponse.ok) {
                throw new Error(
                    `同步第 ${i / batchSize + 1} 批数据失败: ${postResponse.statusText}`
                );
            }

            const result: any = await postResponse.json();
            successCount += result.count || batch.length;
            console.log(
                `已完成: ${Math.min(i + batchSize, regions.length)} / ${regions.length}`
            );
        }

        console.log(`同步完成！共导入 ${successCount} 条数据。`);
    } catch (error) {
        console.error('同步失败:', error.message);
    }
}

seed();
