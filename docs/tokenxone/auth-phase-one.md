# TokenXOne 第一期认证实现与开通说明

代码已部署到现有服务器。邮箱验证、GitHub 和 Google 的正式开通仍需配置域名、邮件服务和 OAuth 凭据；服务器上的三个开关保持关闭，尚未进行真实邮箱收信和第三方账号授权联调。

## 已实现

- 首页和导航登录入口使用认证弹窗；登录、注册、密码恢复独立页使用同一套表单。
- 邮箱验证开启后，新用户用邮箱、验证码和密码注册，服务器生成内部用户名；保留旧账号用户名登录兼容。
- GitHub 复用现有 OAuth 流程。Google 通过 OIDC 接入，并在后端校验 ID Token 签名、签发方、应用 ID、有效期、用户标识和已验证邮箱。
- 密码恢复改为用户设置并确认新密码，不再返回、显示或复制系统生成的密码；重置成功后撤销现有登录会话并发送通知邮件。
- 验证码和重置令牌有效期为现有配置的 10 分钟，原子消费防止并发重复使用，每个挑战最多 5 次错误尝试；继续使用现有接口限流。
- 登录、注册、找回密码和 OAuth 保留目标页；只允许站内地址，过滤认证页循环跳转。
- 邮件恢复链接包含经过后端过滤的目标页，支持在其他标签页或设备打开。
- 邮件发送接口使用统一的成功响应并异步发送，避免通过 SMTP 响应时长直接区分账号是否存在。
- Nginx HTTPS 访问日志只记录路径，不记录查询参数；重置和 OAuth 回调页面使用 no-store 和 no-referrer。

## 正式开通

先确定一个带可信 HTTPS 证书的正式域名。下文 `https://你的域名` 必须统一替换为同一个正式站点地址。

1. **基础配置**：DNS 指向服务器；配置 HTTPS；后台的服务器地址设为正式域名；同步容器的 `SESSION_COOKIE_TRUSTED_URL`。这决定邮件链接和 OAuth 回调地址。
2. **邮箱**：在后台填 SMTP 主机、端口、发信地址、认证账号和密码/授权码；发送测试邮件并确认收件后，开启邮箱验证、密码登录和邮箱注册。凭据只保存在后台或服务器，不要发到聊天或提交进 Git。
3. **GitHub**：创建 OAuth App；Homepage URL 使用正式域名；Authorization callback URL 使用 `https://你的域名/oauth/github`；把 Client ID、Client Secret 填入后台后开启 GitHub 登录。
4. **Google**：创建 Web application 类型 OAuth 客户端；配置同意页面与测试用户/正式发布状态；Authorized redirect URI 使用 `https://你的域名/oauth/oidc`。后台 OIDC 显示名称填 `Google`，发现地址填 `https://accounts.google.com/.well-known/openid-configuration`，保存客户端凭据和发现的端点，再启用。
5. **真实联调**：分别完成新邮箱注册、验证码重发/失效、邮箱密码登录、密码恢复、GitHub/Google 授权与取消授权；从 Models、Dashboard 或带参数的目标页进入认证后核对返回位置。

Google 使用现有 OIDC 身份绑定，因此回调路径是 `/oauth/oidc`，不是 `/oauth/google`。不要把已有的 OIDC 身份提供商直接替换为另一家；本服务器检查时 OIDC 尚未配置。

官方参考：[GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)、[Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)。

## 验证与部署

- 前端：5 个测试文件、32 项测试通过；类型检查、修改文件 lint、格式化和生产构建通过。
- 后端：common、controller、oauth 三个包的相关认证回归通过；覆盖邮箱注册、验证码并发单次使用、过期和尝试次数、密码重置、会话失效，以及 Google 令牌异常情况。
- 候选容器使用线上 SQLite 的独立备份启动；健康检查通过，186 个表/索引定义与线上一致。本次没有修改模型、数据库结构或 ORM 查询实现。
- 正式版本：`v1.0.0-rc.44+tokenxone.auth1`。
- 前端发布目录：`/var/www/tokenxone/releases/20261015-auth-phase1`。
- 后端镜像：`tokenxone/new-api:auth-phase1`。
- 备份：`/opt/new-api/backups/tokenxone-auth-20261015`，包含发布前数据库、Compose、Nginx 和原前端指向。
- 邮件服务和真实 OAuth 授权尚未配置/验收，不能将本次结果视为三种方式已经正式可用。

安全参考为 OWASP ASVS 5.0.0 及 [Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)、[Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)、[Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)、[OAuth2](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html) Cheat Sheets。本次记录的是具体实现与测试，不代表全站完成 ASVS 合规认证。

