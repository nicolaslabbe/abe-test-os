'use strict';

function getHreflang(url, json, abe) {
	var hreflang = "";
	if(typeof url !== 'undefined' && url !== null) {
		var hrefLangRex = /.*/;
		if(typeof abe.config.seo.hreflangRegex !== 'undefined' && abe.config.seo.hreflangRegex !== null) {
			hrefLangRex = new RegExp(abe.config.seo.hreflangRegex);
			hreflang = url.match(hrefLangRex);
			if(typeof hreflang !== 'undefined' && hreflang !== null
				&& typeof hreflang[1] !== 'undefined' && hreflang[1] !== null) {
				hreflang = hreflang[1];
			}
		}else if(typeof abe.config.seo.hreflangRegex !== 'undefined' && abe.config.seo.hreflangRegex !== null) {
			
		}
	}
	hreflang = "<link rel=\"alternate\" href=\"" + url + "\" hreflang=\"" + hreflang + "\" />\n"

	return hreflang;
}

var hooks = {
	beforeUpdate: function(json, oldFilePath, template, path, name, req, deleteFiles, abe) {
		try {
				
			if(typeof deleteFiles !== 'undefined' && deleteFiles !== null && deleteFiles === true) {
				abe.log.write('seo', 'beforeDuplicate')
		    var tplUrl = abe.FileParser.getFileDataFromUrl(abe.fileUtils.concatPath(abe.config.draft.url, oldFilePath))
		    var oldJson = abe.FileParser.getJson(tplUrl.json.path)

		    if(typeof oldJson !== 'undefined' && oldJson !== null
			    && typeof oldJson.seoPlugin !== 'undefined' && oldJson.seoPlugin !== null
			    && typeof oldJson.seoPlugin.alternates !== 'undefined' && oldJson.seoPlugin.alternates !== null) {
		    	var alternates = oldJson.seoPlugin.alternates

		    	if (oldJson.seoPlugin.alternates === oldJson.abe_meta.link) {
			    	var folder = abe.fileUtils.concatPath(abe.config.root, abe.config.data.url)
			    	var files = abe.FileParser.getFiles(folder, true, 99, /\.json/)
			    	var useFirst = abe.fileUtils.concatPath(path, name)
						useFirst = abe.fileUtils.removeExtension(useFirst) + '.' + abe.config.files.templates.extension
			    	Array.prototype.forEach.call(files, function(file) {
			    		var jsonCheck = abe.FileParser.getJson(file.path)
			    		if(typeof jsonCheck.seoPlugin !== 'undefined' && jsonCheck.seoPlugin !== null
						    && typeof jsonCheck.seoPlugin.alternates !== 'undefined' && jsonCheck.seoPlugin.alternates !== null
						    && jsonCheck.seoPlugin.alternates === alternates) {
			    			jsonCheck.seoPlugin.alternates = useFirst

			    			abe.log.write('seo', 'update > ' + file.path)
			    			abe.log.write('seo', 'set > ' + useFirst + ' > ' + useFirst)
			    			abe.saveJson(file.path, jsonCheck);
			    		}
			    	})
			    	json.seoPlugin.alternates = useFirst
		    	}
		    }
			}
		} catch(e) {
			// statements
			console.log(e);
		}

		return json
	},
	beforeDeleteFile: function(filePath, abe) {
		abe.log.write('seo', 'beforeDeleteFile')
    var tplUrl = abe.FileParser.getFileDataFromUrl(abe.fileUtils.concatPath(abe.config.draft.url, filePath))
    var json = abe.FileParser.getJson(tplUrl.json.path)

    if(typeof json !== 'undefined' && json !== null
	    && typeof json.seoPlugin !== 'undefined' && json.seoPlugin !== null
	    && typeof json.seoPlugin.alternates !== 'undefined' && json.seoPlugin.alternates !== null) {
    	var alternates = json.seoPlugin.alternates

    	if (json.seoPlugin.alternates === json.abe_meta.link) {
	    	var folder = abe.fileUtils.concatPath(abe.config.root, abe.config.data.url)
	    	var files = abe.FileParser.getFiles(folder, true, 99, /\.json/)
	    	var useFirst = null
	    	Array.prototype.forEach.call(files, function(file) {
	    		var jsonCheck = abe.FileParser.getJson(file.path)
	    		if(typeof jsonCheck.seoPlugin !== 'undefined' && jsonCheck.seoPlugin !== null
				    && typeof jsonCheck.seoPlugin.alternates !== 'undefined' && jsonCheck.seoPlugin.alternates !== null
				    && jsonCheck.seoPlugin.alternates === alternates && jsonCheck.abe_meta.link !== alternates) {
	    			if (useFirst === null) {
	    				useFirst = jsonCheck.abe_meta.link
	    			}
	    			jsonCheck.seoPlugin.alternates = useFirst

	    			abe.log.write('seo', 'update > ' + file.path)
	    			abe.saveJson(file.path, jsonCheck);
	    		}
	    	})
    	}
    }

    return filePath
  },
	afterHandlebarsHelpers: function(Handlebars, abe) {
    Handlebars.registerHelper('hreflangs', function(url, obj, ctx) {
      return getHreflang(url, obj, abe);
    });
    return Handlebars
  },
	afterGetTemplate: function(text, abe) {
		var params = (abe.config.seo.hreflangVariableJson) ? 'abe_meta,'+abe.config.seo.hreflangVariableJson : 'abe_meta'
		var select = "{{abe type='data' key='hreflangs' desc='hreflangs' source='select " + params + " from / where `seoPlugin.alternates`=`{{seoPlugin.alternates}}`' editable='false'}}"

		var str =  "\n{{#each hreflangs}}\n"
				str += "  {{&hreflangs abe_meta.link this}}\n"
				str += "{{/each}}\n"
				str += '</head>'
		text = text.replace(/<\/head>/, str)
		text = select + text
    return text
  },
	afterCreate: function(json, text, path, name, req, forceJson, abe) {
		if(typeof json.seoPlugin === 'undefined' || json.seoPlugin === null
			|| typeof json.seoPlugin.alternates === 'undefined' || json.seoPlugin.alternates === null) {
			var filePath = abe.fileUtils.concatPath(path, name)
			filePath = abe.fileUtils.removeExtension(filePath) + '.' + abe.config.files.templates.extension
			abe.log.write('seo', 'afterCreate ' + filePath)
			json['seoPlugin'] = { alternates: filePath };
		}

		return json;
	},
	afterDuplicate: function(json, oldFilePath, template, path, name, req, deleteFiles, abe) {
		try {
			if(typeof json.seoPlugin === 'undefined' || json.seoPlugin === null
				|| typeof json.seoPlugin.alternates === 'undefined' || json.seoPlugin.alternates === null) {
				var tplUrl = abe.FileParser.getFileDataFromUrl(oldFilePath);

				var oldJson = abe.FileParser.getJson(tplUrl.json.path);
				json['seoPlugin'] = { alternates: oldJson.seoPlugin.alternates };
				abe.log.write('seo', 'afterCreate use ' + tplUrl.json.path + ' < ' + oldJson.seoPlugin.alternates)
			}
		} catch(e) {
				
			console.log(e);
		}

		return json;
	}
};

exports.default = hooks;