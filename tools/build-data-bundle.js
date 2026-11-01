/* 生成 js/data-bundle.js：把 data/*.json 内联成 window.DATA_BUNDLE。
 *
 * 用途：浏览器在 file:// 协议下会拦截 XMLHttpRequest（Chrome / Edge 必然失败），
 *       直接双击 index.html 时游戏会拿不到数据。内置副本作为兜底，让「双击即玩」成立。
 *       通过 http(s) 打开时仍优先走 XHR，因此你改 data/*.json 依旧即时生效。
 *
 * 用法：修改 data/*.json 后执行
 *         node tools/build-data-bundle.js
 *       并把生成的 js/data-bundle.js 一起提交。
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const outFile = path.join(root, 'js', 'data-bundle.js');

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).sort();
const bundle = {};
for (const f of files) {
  bundle['data/' + f] = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
}

const js =
  '/* 自动生成，请勿手动修改。\n' +
  ' * 来源：data/*.json（共 ' + files.length + ' 个文件）\n' +
  ' * 重新生成：node tools/build-data-bundle.js\n' +
  ' * 用途：file:// 协议下 XHR 被浏览器拦截时的数据兜底。\n' +
  ' */\n' +
  'window.DATA_BUNDLE=' + JSON.stringify(bundle) + ';\n';

fs.writeFileSync(outFile, js);
console.log('已生成 js/data-bundle.js：' + files.length + ' 个 JSON，' + (js.length / 1024).toFixed(0) + ' KB');
console.log(files.map(f => '  - data/' + f).join('\n'));
