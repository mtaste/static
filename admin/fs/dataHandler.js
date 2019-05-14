var DH = {
	ConvertJson: function (data) {
		for (var k in data) {
			var obj = data[k];
			if (DH.isJSON(obj)) {
				data[k] = JSON.parse(obj);
			}
		}
		return data;
	},
	isJSON: function (str) {
		if (typeof str == 'string') {
			try {
				var obj = JSON.parse(str);
				if (typeof obj == 'object' && obj) {
					return true;
				} else {
					return false;
				}
			} catch (e) {
				return false;
			}
		}
	},
	ConvertCol: function (data) {
		var col = [];
		for (var k in data) {
			var obj = data[k];
			var c = {};
			if (obj.other) {
				c = JSON.parse(obj.other);
			}
			for (var i in obj) {
				if (obj[i] && i != 'other') {
					c[i] = obj[i]
				}
			}
			c.title = vm.$t('col.' + c.title);
			col.push(c);
		}
		return col;
	},
	ConvertForm: function (data) {
		var d = [];
		for (var k in data) {
			var obj = data[k];
			var t = {};
			for (var j in obj) {
				if (obj[j]) {
					t[j] = obj[j];
					if (j == 'source') {
						t['ele'] = [];
					} else if (j == "validates") {
						t[j] = DH.getValidates(obj[j]);
					}
				}
			}
			d.push(t);
		}
		return d;
	},
	getValidates: function (data) {
		var vs = [];
		var vt = data.split(";");
		for (var k in vt) {
			var obj = vt[k].split(",");
			var vali = {
				"rule": obj[0],
				"msg": obj[1]
			}
			vs.push(vali);
		}
		return vs;
	},
	MConvertForm: function (data) {
		var d = [];
		for (var k in data) {
			var obj = data[k];
			var t = {
				name: obj.name,
				value: obj.name,
				type: obj.type
			};
			d.push(t);
		}
		return d;
	},
	List2Object: function (data) {
		var ret = {};
		for (var k in data) {
			var obj = data[k];
			ret[obj.name] = obj.value;
		}
		return ret;
	},
	AddTreeNode: function (_json, _nodeId, _node, id, ch) {
		var n = DH.GetParentNode(_json, _nodeId, id, ch);
		n.parentNode[ch].push(_node);
	},
	RemoveTreeNode: function (_json, _nodeId, id, ch) {
		var n = DH.GetParentNode(_json, _nodeId, id, ch);
		var chs = n.parentNode[ch];
		var index = -1;
		for (var v in chs) {
			var obj = chs[v];
			if (obj[id] == _nodeId) {
				index = v;
				break;
			}
		}
		if (index >= 0) {
			n.parentNode[ch].splice(index, 1);
		}
	},
	GetParentNode: function (_json, _nodeId, id, ch) {
		/**
		 * 根据NodeID查找当前节点以及父节点
		 * 
		 * @param  {[type]}
		 * @param  {[type]}
		 * @return {[type]}
		 */
		var parentNode = {};
		var node = null;

		function getNode(json, nodeId) {
			//1.第一层 root 深度遍历整个JSON
			for (var i = 0; i < json.length; i++) {
				if (node) {
					break;
				}
				var obj = json[i];
				//没有就下一个
				if (!obj || !obj[id]) {
					continue;
				}

				//2.有节点就开始找，一直递归下去
				if (obj[id] == nodeId) {
					//找到了与nodeId匹配的节点，结束递归
					node = obj;
					break;
				} else {
					//3.如果有子节点就开始找
					if (obj[ch]) {
						//4.递归前，记录当前节点，作为parent 父亲
						parentNode[obj[id]] = obj;
						//递归往下找
						getNode(obj[ch], nodeId);
					} else {
						//跳出当前递归，返回上层递归
						continue;
					}
				}
			}

			//5.如果木有找到父节点，置为null，因为没有父亲  
			if (!node) {
				return;
			}
			//6.返回结果obj
			return {
				parentNode: parentNode[node.parent_id],
				node: node
			};
		};
		return getNode(_json, _nodeId);
	},
	TransData: function (src, idStr, pidStr, chindrenStr) {

		// 2.0数据转换为树形结构
		/**
		 * json格式转树状结构
		 * 
		 * @param {json}
		 *            json数据
		 * @param {String}
		 *            id的字符串
		 * @param {String}
		 *            父id的字符串
		 * @param {String}
		 *            children的字符串
		 * @return {Array} 数组
		 */
		var a = JSON.parse(JSON.stringify(src));
		var r = [],
			hash = {},
			id = idStr,
			pid = pidStr,
			children = chindrenStr,
			i = 0,
			j = 0,
			len = a.length;
		for (; i < len; i++) {
			a[i]["title"] = a[i]['name'];
			hash[a[i][id]] = a[i];
		}
		for (; j < len; j++) {
			var aVal = a[j],
				hashVP = hash[aVal[pid]];
			if (hashVP) {
				!hashVP[children] && (hashVP[children] = []);
				hashVP[children].push(aVal);
			} else {
				r.push(aVal);
			}
		}
		return r;
	}
}
