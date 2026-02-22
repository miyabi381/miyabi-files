import fs from 'fs';
import path from 'path';

environment: "node";
export async function GET() {
  // ルートの絶対パスを取得
  const loadfilesDir = path.resolve(process.cwd(), 'public', 'loadfiles');
  let files: string[];
  try {
    //　ディレクトリ内のファイル名を取得
    files = getAllFiles(loadfilesDir);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Unable to read directory', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ files }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// 指定したディレクトリ内の全てのファイルを再帰的に取得する関数
function getAllFiles(dir: string, base = ""): string[] {
  // ディレクトリ内のエントリを取得（ファイルとサブディレクトリ）
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let results: string[] = [];

  for (const entry of entries) {
    // エントリのフルパスと、ベースからの相対パスを作成
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(base, entry.name);

    if (entry.isDirectory()) { // エントリがディレクトリの場合は再帰的に探索
      results = results.concat(getAllFiles(fullPath, relativePath));
    } else {
      results.push(relativePath);
    }
  }

  return results;
}