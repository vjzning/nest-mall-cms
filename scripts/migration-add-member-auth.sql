-- 创建第三方认证关联表
CREATE TABLE `mall_member_auth` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `member_id` bigint NOT NULL COMMENT '关联会员ID',
  `provider` varchar(20) NOT NULL COMMENT '第三方平台名称 (github, wechat, google)',
  `provider_id` varchar(100) NOT NULL COMMENT '第三方平台唯一ID',
  `unionid` varchar(100) DEFAULT NULL COMMENT '微信UnionID',
  `nickname` varchar(50) DEFAULT NULL COMMENT '第三方平台昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '第三方平台头像',
  `metadata` json DEFAULT NULL COMMENT '原始元数据',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_PROVIDER_PROVIDER_ID` (`provider`, `provider_id`),
  KEY `IDX_MEMBER_ID` (`member_id`),
  CONSTRAINT `FK_MEMBER_AUTH_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `mall_member` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入 GitHub OAuth 默认配置
INSERT INTO `sys_config` (`key`, `value`, `group`, `is_encrypted`, `description`) VALUES 
('github.client_id', 'YOUR_GITHUB_CLIENT_ID', 'auth', 0, 'GitHub OAuth Client ID'),
('github.client_secret', 'YOUR_GITHUB_CLIENT_SECRET', 'auth', 1, 'GitHub OAuth Client Secret'),
('github.callback_url', 'http://localhost:3001/auth/github/callback', 'auth', 0, 'GitHub OAuth Callback URL');

-- 插入 微信 OAuth 默认配置
INSERT INTO `sys_config` (`key`, `value`, `group`, `is_encrypted`, `description`) VALUES 
('wechat.app_id', 'YOUR_WECHAT_APP_ID', 'auth', 0, 'WeChat App ID'),
('wechat.app_secret', 'YOUR_WECHAT_APP_SECRET', 'auth', 1, 'WeChat App Secret'),
('wechat.callback_url', 'http://localhost:3001/auth/wechat/callback', 'auth', 0, 'WeChat Callback URL');
