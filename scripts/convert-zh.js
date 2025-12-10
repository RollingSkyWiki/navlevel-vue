import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chineseConv from 'chinese-conv';

function convertToTraditional() {
  try {
    console.log('开始转换简体中文到繁体中文...');
    
    // 文件路径
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const inputFile = join(__dirname, '..', 'README.md');
    const outputFile = join(__dirname, '..', 'README-hant.md');
    
    // 读取文件内容
    const content = readFileSync(inputFile, 'utf8');
    
    // 转换内容
    const convertedContent = chineseConv.tify(content);
    
    // 写入转换后的内容
    writeFileSync(outputFile, convertedContent, 'utf8');
    
    console.log(`转换完成，已生成: ${outputFile}`);
  } catch (error) {
    console.error('转换失败:', error);
  }
}

convertToTraditional();