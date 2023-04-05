const StyleDictionaryPackage = require('style-dictionary');

// HAVE THE STYLE DICTIONARY CONFIG DYNAMICALLY GENERATED

StyleDictionaryPackage.registerFormat({
  name: 'scss/variables',
  formatter: function (dictionary, config) {
    let asd = dictionary.allProperties.map(prop => `  --${prop.name}: ${prop.value};`).join('\n');
    let qwe = dictionary.allProperties.map(function(prop, i) {
        if(prop.name.includes("display") || prop.name.includes("text")){
          return `\t.${prop.name}{ \n\t\t${prop.value}; \n\t}`;
        }
        else{
          return `  --${prop.name}: ${prop.value};`;
        }
    }).join('\n');

      return `${this.selector} {
        ${qwe}
      }`
  }
});  

StyleDictionaryPackage.registerTransform({
    name: 'sizes/px',
    type: 'value',
    matcher: function(prop) {
        // You can be more specific here if you only want 'em' units for font sizes    
        return ["fontSize", "spacing", "borderRadius", "borderWidth", "sizing", "lineHeights", "paragraphSpacing"].includes(prop.attributes.category);
    },
    transformer: function(prop) {
        // You can also modify the value here if you want to convert pixels to ems
        return parseFloat(prop.original.value) + 'px';
    }
});

StyleDictionaryPackage.registerTransform({
  name: "shadow/css",
  type: "value",
  transitive: true, // Necessary when the color is an alias reference, or the shadows themselves are aliased
  matcher: (token) => token.type === "boxShadow",
  transformer: (token) => {
    // Allow both single and multi shadow tokens:
    const shadows = Array.isArray(token.value) ? token.value : [token.value];

    const transformedShadows = shadows.map((shadow) => {
      const { x, y, blur, spread, color, type } = shadow;
      const inset = type === "innerShadow" ? "inset " : "";
      return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
    });

    return transformedShadows.join(", ");
  },
});

StyleDictionaryPackage.registerTransform({
  name: 'typography/mix',
  type: 'value',
  transitive: true,
  matcher: token => token.type === 'typography',
  transformer: (token) => {
    const {value} = token
    return `font-family: ${value.fontFamily};
      font-weight: ${value.fontWeight};
      line-height: ${value.lineHeight};
      font-size: ${value.fontSize}px;
      letter-spacing: ${value.letterSpacing};
      line-height: ${value.paragraphSpacing}px;
      text-indent: ${value.paragraphIndent};
      text-transform: ${value.textCase};
      text-decoration: ${value.textDecoration}`
  }
});

function getStyleDictionaryConfig(theme) {
  return {
    "source": [
      `tokens/${theme}.json`,
    ],
    "platforms": {
      "scss": {
        "transformGroup": "scss",
        "transforms": ["attribute/cti", "name/cti/kebab", "sizes/px", "shadow/css", "typography/mix"],
        "buildPath": `output/`,
        "files": [{
            "destination": `${theme}.scss`,
            "format": "scss/variables",
            "selector": `.${theme}-theme`,
            "options": {
              // Look here 👇
              "outputReferences": true
            }
          }]
      },
      "web": {
        "transforms": ["attribute/cti", "name/cti/kebab", "sizes/px", "shadow/css", "typography/mix"],
        "buildPath": `output/`,
        "files": [{
            "destination": `${theme}.css`,
            "format": "css/variables",
            "selector": `.${theme}-theme`
          }]
      }
    }
  };
}

console.log('Build started...');

// PROCESS THE DESIGN TOKENS FOR THE DIFFEREN BRANDS AND PLATFORMS

['global', 'dark', 'light'].map(function (theme) {

    console.log('\n==============================================');
    console.log(`\nProcessing: [${theme}]`);

    const StyleDictionary = StyleDictionaryPackage.extend(getStyleDictionaryConfig(theme));

    StyleDictionary.buildPlatform('scss');
    console.log('\nEnd processing');
})

console.log('\n==============================================');
console.log('\nBuild completed!');
