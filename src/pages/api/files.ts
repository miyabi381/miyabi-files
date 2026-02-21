// src/pages/api/files.ts
import fs from 'fs';
import path from 'path';

// Astro server endpoint that returns the contents of src/loadfiles
environment: "node";
export async function GET() {
  const loadfilesDir = path.resolve(process.cwd(), 'src', 'loadfiles');
  let files: string[];
  try {
    files = fs.readdirSync(loadfilesDir);
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