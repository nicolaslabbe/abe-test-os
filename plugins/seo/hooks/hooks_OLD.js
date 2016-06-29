'use strict';

function createSeo(json, abe, duplicate = null) {
	if(typeof json.seoPlugin === 'undefined' || json.seoPlugin === null
		|| typeof json.seoPlugin.alternates === 'undefined' || json.seoPlugin.alternates === null) {
		json['seoPlugin'] = { alternates: [] };
	}

	if(typeof duplicate !== 'undefined' && duplicate !== null && duplicate !== '') {
		var found = false
		Array.prototype.forEach.call(json.seoPlugin.alternates, (alternate) => {
			if (duplicate === alternate.href) {
				found = true;
			}
		})
		if (!found) {
			json.seoPlugin.alternates.push({
				hreflang: getHreflang(duplicate, abe),
				href: duplicate
			});
		}
	}

	return json
}

function getHreflang(url, abe) {
	var hrefLangRex = /.*/;
	var hreflang = "";
	if(typeof abe.config.seo.hreflangRegex !== 'undefined' && abe.config.seo.hreflangRegex !== null) {
		hrefLangRex = new RegExp(abe.config.seo.hreflangRegex);
		hreflang = url.match(hrefLangRex);
		if(typeof hreflang !== 'undefined' && hreflang !== null
			&& typeof hreflang[1] !== 'undefined' && hreflang[1] !== null) {
			hreflang = hreflang[1];
		}
	}

	return hreflang;
}

function updateOtherFiles(filesNeedUpdate, alternates, abe) {
	Array.prototype.forEach.call(filesNeedUpdate, function(url) {
		if(typeof url !== 'undefined' && url !== null) {
			abe.log.write('seo', 'triggered by ' + url)
			var folder = url.split('/');
			var filename = folder.pop();
			var folderDraft = abe.fileUtils.concatPath(abe.config.root, abe.config.draft.url, folder.join('/'));
			var filePublish = abe.fileUtils.concatPath(abe.config.root, abe.config.data.url, folder.join('/'), abe.fileAttr.delete(filename).replace(new RegExp("\\." + abe.config.files.templates.extension), '.json'));
			if (abe.fileUtils.isFile(filePublish)) {
				abe.log.write('seo', 'update seo for ' + filePublish)
				var jsonPublish = abe.FileParser.getJson(filePublish);
				jsonPublish = createSeo(jsonPublish, abe);
				jsonPublish.seoPlugin.alternates = alternates;
				abe.saveJson(filePublish, jsonPublish);
			}

			var files = abe.FileParser.getFiles(folderDraft, true, 1, new RegExp("\\." + abe.config.files.templates.extension));

	    var revisions = abe.fileAttr.getFilesRevision(files, url);
			Array.prototype.forEach.call(revisions, function(revision) {
				abe.log.write('seo', 'update seo for ' + revision.path)
				var tplUrl = abe.FileParser.getFileDataFromUrl(revision.path);

				var json = abe.FileParser.getJson(tplUrl.json.path);
				json = createSeo(json, abe);
				json.seoPlugin.alternates = alternates;
				abe.saveJson(tplUrl.json.path, json);
			})
		}
	})
}

var hooks = {
	afterGetTemplate: function(text, abe) {
		var str =  "\n{{#each seoPlugin.alternates}}\n"
				str += "<link rel=\"alternate\" href=\"{{href}}\" hreflang=\"{{hreflang}}\" />\n"
				str += "{{/each}}\n"
				str += '</head>'
			text = text.replace(/<\/head>/, str)
     return text
  },
	afterCreate: function(json, text, path, name, req, forceJson, abe) {
		json = createSeo(json, abe);

		return json;
	},
	afterDuplicate: function(json, oldFilePath, template, path, name, req, deleteFiles, abe) {
		abe.log.write('seo', '* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
		abe.log.write('seo', 'afterDuplicate')
		try {
			json = createSeo(json, abe, oldFilePath);
			var filePath = abe.fileUtils.concatPath(path, name);
			filePath = abe.fileUtils.removeExtension(filePath) + '.' + abe.config.files.templates.extension.replace('.');
			
			var found = false;
			var filesNeedUpdate = [];
			var alternates = [];
			Array.prototype.forEach.call(json.seoPlugin.alternates, function(alternate) {
				if (filePath === alternate.href) {
					found = true;
					alternates.push(alternate);
				}else {
					abe.log.write('seo', JSON.stringify(alternate))
					filesNeedUpdate.push(alternate.href);
					alternates.push(alternate);
				}
			})

			if (!found) {
				var newHreflang = {
					hreflang: getHreflang(filePath, abe),
					href: filePath
				}
				abe.log.write('seo', JSON.stringify(newHreflang))
				json.seoPlugin.alternates.push(newHreflang);
				alternates.push(newHreflang);
			}
			updateOtherFiles(filesNeedUpdate, alternates, abe);
		} catch(e) {
				
			console.log(e);
		}

		return json;
	}
};

exports.default = hooks;