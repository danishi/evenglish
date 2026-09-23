// Even Hub の Change log 欄に貼る変更サマリを作る（500 文字以内）。
// 使い方: node scripts/changelog.mjs <前回のビルドの ref>
// ref が無い・見つからないときは直近 20 件のコミットから作る。
import { execFileSync } from 'node:child_process';

const LIMIT = 500;
const since = process.argv[2];

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

let range = ['-20', 'HEAD'];
if (since) {
  try {
    git('rev-parse', '--verify', '--quiet', `${since}^{commit}`);
    range = [`${since}..HEAD`];
  } catch {
    // 見つからなければ既定の範囲を使う
  }
}

const subjects = git('log', '--no-merges', '--format=%s', ...range)
  .split('\n')
  .filter(Boolean);

if (subjects.length === 0) {
  console.log('- 変更なし（再ビルド）');
  process.exit(0);
}

const lines = [];
for (let i = 0; i < subjects.length; i++) {
  const line = `- ${subjects[i]}`;
  const rest = subjects.length - i - 1;
  const more = rest > 0 ? `\n- ほか ${rest} 件` : '';
  const next = [...lines, line].join('\n');
  if (next.length + more.length > LIMIT) {
    // 1 行目から入りきらないときは、その行を切り詰める
    if (i === 0) lines.push(`${line.slice(0, LIMIT - more.length - 1)}…`);
    const left = subjects.length - lines.length;
    if (left > 0) lines.push(`- ほか ${left} 件`);
    break;
  }
  lines.push(line);
}

console.log(lines.join('\n'));
