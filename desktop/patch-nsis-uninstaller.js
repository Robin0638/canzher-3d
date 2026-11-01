// 修复 electron-builder 25.1.8 在 x64 Windows 上构建 arm64 NSIS 安装器失败的问题：
// 签名卸载器时它会直接执行刚生成的 arm64 安装器 stub（x64 宿主无法运行 ARM64 PE，
// 报 spawn UNKNOWN）。失败时回退为 UninstallerReader.exec —— 纯解析 NSIS 存档提取
// 卸载器（与 macOS Catalina 路径相同），不依赖执行 stub。
// 用法：npm install 之后执行一次 `node patch-nsis-uninstaller.js`（幂等）。
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'node_modules', 'app-builder-lib', 'out', 'targets', 'nsis', 'NsisTarget.js');
let src = fs.readFileSync(target, 'utf8');

const needle = 'await (0, wine_1.execWine)(installerPath, null, [], { env: { __COMPAT_LAYER: "RunAsInvoker" } });';
if (src.includes('UninstallerReader.exec(installerPath, uninstallerPath);\n            }\n        }')) {
  console.log('patch already applied');
  process.exit(0);
}
if (!src.includes(needle)) {
  console.error('needle not found — electron-builder version may differ, patch manually');
  process.exit(1);
}

const replacement = `try {
                await (0, wine_1.execWine)(installerPath, null, [], { env: { __COMPAT_LAYER: "RunAsInvoker" } });
            }
            catch (error) {
                // arm64 installer stub cannot be executed on an x64 host —
                // extract the uninstaller from the NSIS archive instead (same as macOS path)
                builder_util_1.log.warn(\`cannot execute installer stub (\${error.message}); extracting uninstaller via UninstallerReader\`);
                await nsisUtil_1.UninstallerReader.exec(installerPath, uninstallerPath);
            }`;

src = src.replace(needle, replacement);
fs.writeFileSync(target, src);
console.log('patched', target);
