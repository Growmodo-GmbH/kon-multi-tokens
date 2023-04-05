const StyleDictionaryPackage = require('style-dictionary');

// HAVE THE STYLE DICTIONARY CONFIG DYNAMICALLY GENERATED S

StyleDictionaryPackage.registerFormat({
    name: 'scss/variables',
    formatter: function (dictionary, config) {
      return `${this.selector} {
        ${dictionary.allProperties.map(prop => `  --${prop.name}: ${prop.value};`).join('\n')}
      }`
    }
  });  

StyleDictionaryPackage.registerTransform({
    name: 'sizes/px',
    type: 'value',
    matcher: function(prop) {
        // You can be more specific here if you only want 'em' units for font sizes    
        return ["fontSize", "spacing", "borderRadius", "borderWidth", "sizing"].includes(prop.attributes.category);
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

function getStyleDictionaryConfig(theme) {
  return {
    "source": [
      `tokens/${theme}.json`,
    ],
    "platforms": {
      "scss": {
        "transformGroup": "scss",
        "transforms": ["attribute/cti", "name/cti/kebab", "sizes/px","shadow/css"],
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
