String.prototype.polysub = function() {
  var nu = this;
  for(var i=0; i<arguments.length;i++) {
    nu = nu.replace(arguments[i][0],arguments[i][1]);
  }
  return nu;
}; // class String;def polysub(*a) a.inject(self) {|s,params| s.sub(*params)} end

var compose = function(f,g) {return function(x) {return f(g(x));};}

var OOGF = function(n){return ([function(c,ba){return c+ba;},function(c,ba){return '*'+ba+c;}][Math.floor(n/8)%2])('aehiouw'.charAt(Math.floor((n%256)/16)),')('.charAt(n%2)+['','\\','/','='][Math.floor(n/2)%4])};
var LOLD = function(n){ return "aehiouw".charAt(Math.floor((n/2)%8))+'\\/'.charAt(n%2);}
var BOAF = function(n){return OOGF(n-[0x80,0x70,0x40][Math.floor((n%128)/16)])+'|';}
var BCF = function(n){return (['@\\|','@|','@/|','','@=','@=|','','','*\\@','*/@','*@|'][n%16-2]).replace(/@/,'ahw'.charAt(Math.round(Math.sqrt(Math.floor(n/16)%16-11))));}
var DE = function (n) {return (['','','@+\\','@+/','','','@=','@+=','','','*\\@','*/@'][n%16]).replace(/@/,"iu".charAt(Math.floor(n/16)%16-13));}


function ptlcd() {
  document.body.innerHTML = document.body.innerHTML.replace(/<ptlcd[^>]*>(.|\n)+?<\/ptlcd>/ig,function(s){
				return '<span style="position: relative; top: 3px;">'+s.replace(/(\n|[^>])+(?=<|$)/g,function(s) {
					return bcht(s.replace(/[\u0391-\u03cb\u1f00-\u1fff]/g,ucbc));
				})+'</span>';
			});
}

function ucbc(c) {
  var n = c.charCodeAt(0);
  var s = n.toString(16).slice(-2);
  if(n < 0x1000) {
	if (n==0x3a2) return c;
	if (n==0x3c2) return 's1';
	if (s.match(/[9b][1-9a-f]|[ac][0-9]/)) return (n>0x3b0?'':'*')+"abgdezhqiklmncopr@stufxyw".charAt((n-0x391)%32);
	if (n==0x3ca) return "i+";
	if (n==0x3cb) return "u+";
	return c;
  }
  if(s.match(/[0-6][0-9a-f]/)) return OOGF(n);
  if(s.match(/7[0-9a-d]/)) return LOLD(n);
  if(s.match(/[89a][0-9a-f]/)) return BOAF(n);
  if(s.match(/[bcf][2-467a-c]/)) return BCF(n);
  if(s.match(/[de][2367ab]/)) return DE(n);
  if(s.match(/b[df]/)) return '*)';
  if(s.match(/c[89]/)) return '*'+"\\/".charAt(n%2)+'e';
  if(s.match(/ef/)) return "*\\";
  if(s.match(/[cde][def]/)) return '*'+')(+'.charAt(Math.floor(n/16)%16-0xc)+"\\/=".charAt(n%16-0xd);
  if(s.match(/[cf][89]/)) return '*'+"\\/".charAt(n%2)+(s[0]==c?'e':'o');
  if(s.match(/f[de]/)) return '*'+'(/'.charAt(n%2);
  if(s=='e4') return 'r';
  if(s=='e5') return 'r(';
  if(s=='ec') return '*(r';
  if(s=='c0') return '*=';
  if(s=='c1') return '*+=';
  return c;
}

function seehtml(n) {return n.innerHTML.polysub([/&/g,'&amp;'],[/</g,'&lt;'],[/\n/g,'<br>']); }

function imago(name) { return '<img src="http://www.poetaexmachina.net/font/'+name+'.gif">';}

function bcht(bc) {
  return bc.replace(/[A-Z]/g,function(c){return c.toLowerCase();}).polysub(
        [/([*][()/\\=]*[a-z])/g,'$12'],
        [/[(]/g,'9'],[/[)]/g,'0'],[/[+]/g,'3'],
        [/\//g,'5'],[/\\/g,'7'],[/=/g,'6'],
        [/2[|]/g,'2i'],
        [/[*]/g,'j'],
        [/[|]/g,'1'],[/s(?!['a-z0-9])/g,'s1'],
        [/"/g,"''"],[/`/g,"'"],
        [/([a-z][0-9]*|[.,'?:])/g,"_$1_"],

[/(')_(?=_[,'])/g,'$1'],
[/_a2/g,'a2'],
[/a2_/g,'a2'],
[/g2_/g,'g2'],
[/_g/g,'g'],
[/g_/g,'g'],
[/z_/g,'z'],
[/_i2/g,'i2'],
[/i2_/g,'i2'],
[/k2_/g,'k2'],
[/_l2/g,'l2'],
[/l2_/g,'l2'],
[/_l/g,'l'],
[/l_/g,'l'],
[/_c2/g,'c2'],
[/c2_/g,'c2'],
[/c_/g,'c'],
[/s2_/g,'s2'],
[/s_/g,'s'],
[/_t2/g,'t2'],
[/t2_/g,'t2'],
[/_t/g,'t'],
[/t_/g,'t'],
[/_u2/g,'u2'],
[/u2_/g,'u2'],
[/y2_/g,'y2'],
[/_e961/g,'e961'],
[/_e96/g,'e96'],
[/e91_/g,'e91'],
[/e9_/g,'e9'],
[/_e061/g,'e061'],
[/_e06/g,'e06'],
[/e01_/g,'e01'],
[/e0_/g,'e0'],
[/e71_/g,'e71'],
[/e7_/g,'e7'],
[/_i951/g,'~i951'],
[/i951_/g,'i951~'],
[/_i95/g,'~i95'],
[/i95_/g,'i95~'],
[/_i961/g,'~i961'],
[/i961_/g,'i961~'],
[/_i96/g,'~i96'],
[/i96_/g,'i96~'],
[/_i971/g,'~i971'],
[/i971_/g,'i971~'],
[/_i97/g,'~i97'],
[/i97_/g,'i97~'],
[/_i91/g,'i91'],
[/_i9/g,'i9'],
[/_i051/g,'~i051'],
[/i051_/g,'i051~'],
[/_i05/g,'~i05'],
[/i05_/g,'i05~'],
[/_i061/g,'~i061'],
[/i061_/g,'i061~'],
[/_i06/g,'~i06'],
[/i06_/g,'i06~'],
[/_i071/g,'~i071'],
[/i071_/g,'i071~'],
[/_i07/g,'~i07'],
[/i07_/g,'i07~'],
[/_i01/g,'i01'],
[/i01_/g,'i01'],
[/_i0/g,'i0'],
[/i0_/g,'i0'],
[/_i351/g,'i351'],
[/i351_/g,'i351'],
[/_i35/g,'i35'],
[/i35_/g,'i35'],
[/_i361/g,'i361'],
[/i361_/g,'i361'],
[/_i36/g,'i36'],
[/i36_/g,'i36'],
[/_i371/g,'i371'],
[/i371_/g,'i371'],
[/_i37/g,'i37'],
[/i37_/g,'i37'],
[/_i31/g,'i31'],
[/i31_/g,'i31'],
[/_i3/g,'i3'],
[/i3_/g,'i3'],
[/_i51/g,'i51'],
[/i51_/g,'i51'],
[/_i5/g,'i5'],
[/i5_/g,'i5'],
[/_i61/g,'i61'],
[/i61_/g,'i61'],
[/_i6/g,'i6'],
[/i6_/g,'i6'],
[/_i71/g,'i71'],
[/_i7/g,'i7'],
[/_j951/g,'~j951'],
[/j951_/g,'j951~'],
[/_j95/g,'~j95'],
[/j95_/g,'j95~'],
[/_j961/g,'~j961'],
[/j961_/g,'j961~'],
[/_j96/g,'~j96'],
[/j96_/g,'j96~'],
[/_j971/g,'~j971'],
[/j971_/g,'j971~'],
[/_j97/g,'~j97'],
[/j97_/g,'j97~'],
[/_j91/g,'j91'],
[/j91_/g,'j91'],
[/_j9/g,'j9'],
[/j9_/g,'j9'],
[/_j051/g,'~j051'],
[/j051_/g,'j051~'],
[/_j05/g,'~j05'],
[/j05_/g,'j05~'],
[/_j061/g,'~j061'],
[/j061_/g,'j061~'],
[/_j06/g,'~j06'],
[/j06_/g,'j06~'],
[/_j071/g,'~j071'],
[/j071_/g,'j071~'],
[/_j07/g,'~j07'],
[/j07_/g,'j07~'],
[/_j01/g,'j01'],
[/j01_/g,'j01'],
[/_j0/g,'j0'],
[/j0_/g,'j0'],
[/_j351/g,'~j351'],
[/j351_/g,'j351~'],
[/_j35/g,'~j35'],
[/j35_/g,'j35~'],
[/_j361/g,'~j361'],
[/j361_/g,'j361~'],
[/_j36/g,'~j36'],
[/j36_/g,'j36~'],
[/_j371/g,'~j371'],
[/j371_/g,'j371~'],
[/_j37/g,'~j37'],
[/j37_/g,'j37~'],
[/_j31/g,'~j31'],
[/j31_/g,'j31~'],
[/_j3/g,'~j3'],
[/j3_/g,'j3~'],
[/_j51/g,'~j51'],
[/j51_/g,'j51~'],
[/_j5/g,'j5'],
[/j5_/g,'j5'],
[/_j61/g,'~j61'],
[/j61_/g,'j61~'],
[/_j6/g,'~j6'],
[/j6_/g,'j6~'],
[/_j71/g,'~j71'],
[/j71_/g,'j71~'],
[/_j7/g,'~j7'],
[/j7_/g,'j7~'],

        [/_?~_?/g,''],[/ /g,'_____'],[/__/g,'_2'],
        [/([a-z_][0-9]*)/g,imago],
        [/[.](?!gif|poetaexmachina|net)/g,imago('per')],
        [/'/g,imago("aps")],
        [/:(?![/])/g,imago("col")],
        [/;/g,imago("que")],
        [/,/g,imago("com")],[/@/g,'<br>\n']);
}

