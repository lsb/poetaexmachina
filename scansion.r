#load 'amb.r'
load 'listmanips.r'

class Array
def rotfirst() self << shift ; last end
end

Mfile = File.readlines(ARGV[0],'/').map {|m| m.downcase.tr('^lrsa','').split('')}
def strmeter
  Mfile.first
end
el = '[468]'
es = '[04]'
parens = lambda {|*args| "(#{args.join '|'})" }
Syll = %w{l s a r}.hashwith( [el,es,[el,es],[el,es*2]].map(&parens).group(%w{8 0 0 8}) )
def meter
  Regexp.new('^'+strmeter.join.gsub(/./) {|c| Syll[c][0]}+'$')
end
Vowel = /[0468](?=[^0468]*\/)/

def getvowels(s) s.scan(Vowel).join.match(meter).to_a.cdr end
def fix4s(m)
  m.group(strmeter.map {|type| Syll[type][1]}).map {|orig, new4|
      orig == '4' ? new4 : orig.tr('4','0')
    }
end
def workit(oneline)
  l = oneline.sub /\s*$/, '/' # a Vowel needs a trailing '/'
  v = getvowels l
  if v
    v = fix4s(v).join + '0'*20 # this is such a kludge
    l.gsub!(Vowel) {v.slice! 0,1} # slice! needs the join, to get exactly 1 char
  end
  [l[0..-2],v] # [0..-2] takes off the trailing '/'; puts will add the '\n'
end

def polygsub(s,rgxarr,&b)
  pos = lambda {|r| q = s.index r; q ? q : s.length} # if no match, make it fall off
  r = rgxarr.min {|r0, r1| pos[r0] <=> pos[r1]}
  m = r.match s
  m ? m.pre_match + b[r,m.to_s] + polygsub(m.post_match,rgxarr, &b) : s
end

Common = [/6(?=\s*[ptckbdg]\/[lr])/,'4']

synhiamon = {	/(%.)[04]\/h?%(?=[0468])/ => '\1',
		/[048](?=[^\/]*%)/ => '\&/',
		/%(.)(.)[48]/ => '%\14/%\24',     }

def workaline(s)
  #ssc = workit(s)
  #ssc[1] ? ssc : workit(s.gsub(*Common))
  workit(s.gsub(*Common))
end

STDIN.each {|l| puts workaline(l)[0]; Mfile.rotfirst}
