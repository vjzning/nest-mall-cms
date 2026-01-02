-- 初始化通知设置
INSERT INTO notification_setting (type, channels, isEnabled, description) VALUES 
('DEFAULT', '["WEB"]', 1, '默认通知配置'),
('STOCK_ZERO', '["WEB", "EMAIL"]', 1, '库存预警通知'),
('ORDER_TIMEOUT', '["WEB", "EMAIL"]', 1, '订单超时通知'),
('AFTERSALE_TIMEOUT', '["WEB", "EMAIL"]', 1, '售后超时通知');
