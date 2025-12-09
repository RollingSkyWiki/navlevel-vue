export default function mwLoaderPlugin() {
  return {
    name: 'mw-loader-transform',
    
    // 第一阶段：在编译时移除Vue和Codex导入，并替换为运行时引用
    transform(code, id) {
      // 处理Vue文件（在编译早期处理）
        console.log(id, "\n", code.substring(0, 100));
      if (id.endsWith('.vue') || id.match(/\.vue\?/)) {
        let transformedCode = code;
        
        // 处理 named imports: import { CdxButton } from '@wikimedia/codex'
        transformedCode = transformedCode.replace(
          /import\s*{([^}]+)}\s*from\s*['"]@wikimedia\/codex['"]\s*;?/g,
          (match, imports) => {
            // 将每个导入的组件转换为从全局Codex对象获取
            const components = imports.split(',').map(c => c.trim());
            return components.map(component => {
              if (component.includes(' as ')) {
                const [original, alias] = component.split(' as ').map(s => s.trim());
                return `const ${alias} = Codex.${original};`;
              } else {
                return `const ${component} = Codex.${component};`;
              }
            }).join('\n');
          }
        );
        
        // 处理 Vue imports: import { defineComponent } from 'vue'
        transformedCode = transformedCode.replace(
          /import\s*{([^}]+)}\s*from\s*['"]vue['"]\s*;?/g,
          (match, imports) => {
            // 将每个导入的API转换为从全局Vue对象获取
            const apis = imports.split(',').map(c => c.trim());
            return apis.map(api => {
              if (api.includes(' as ')) {
                const [original, alias] = api.split(' as ').map(s => s.trim());
                return `const ${alias} = Vue.${original};`;
              } else {
                return `const ${api} = Vue.${api};`;
              }
            }).join('\n');
          }
        );
        
        // 移除类型导入
        transformedCode = transformedCode.replace(
          /import\s+type\s+[^;]+from\s+['"](vue|@wikimedia\/codex)['"]\s*;?/g, 
          ''
        );
        
        // 移除 namespace imports
        transformedCode = transformedCode.replace(
          /import\s*\*\s*as\s+\w+\s+from\s+['"](vue|@wikimedia\/codex)['"]\s*;?/g,
          ''
        );
        
        return {
          code: transformedCode,
          map: null
        }
      }
      
      // 处理TS文件中的Vue相关导入
      if (id.endsWith('.ts')) {
        let transformedCode = code;
        
        // 移除Vue导入但保留类型导入
        transformedCode = transformedCode.replace(
          /import\s+(?:type\s+)?{([^}]+)}\s+from\s+['"]vue['"]\s*;?/g,
          (match) => {
            if (match.includes('type ')) {
              return match;
            }
            return '';
          }
        );
        
        // 移除默认导入
        transformedCode = transformedCode.replace(
          /import\s+\w+\s+from\s+['"]vue['"]\s*;?/g,
          ''
        );
        
        return {
          code: transformedCode,
          map: null
        }
      }
      
      return { code, map: null }
    },
    
    // 第二阶段：在生成bundle后包装mw.loader.using（保持后处理）
    generateBundle(options, bundle) {
      // 遍历所有生成的chunk
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        
        // 只处理JavaScript文件
        if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
          // 检查是否包含Vue或Codex相关代码
          if (chunk.code.includes('Vue') || chunk.code.includes('Codex')) {
            // 在文件开头添加mw.loader.using包装
            chunk.code = `
/// <reference types="types-mediawiki" />
/// <reference types="types-mediawiki-api" />
mw.loader.using(["vue", "@wikimedia/codex", "mediawiki.diff.styles"], function(require) {
  const vueModule = require("vue");
  const codexModule = require("@wikimedia/codex");
  
  
  const Vue = vueModule;
  const Codex = codexModule;
  
  // 原始代码
  ${chunk.code}
  
});
`;
          }
        }
      }
    }
  }
}