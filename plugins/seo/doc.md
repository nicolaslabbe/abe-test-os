#use

> open abe.json file

use regex on your url to extract the lang

```json
{
  "seo": {
    "hreflangRegex": "^\/(.*?)\/"
  }
}
```

or use json variable

```json
{
  "seo": {
    "hreflangVariableJson": "lang"
  }
}
```