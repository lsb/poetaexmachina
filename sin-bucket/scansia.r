load 'listmanips.r'

class Array
def rotfirst() self << shift ; last end
end

Mfile = ["lrlrlrlrlrla"].map {|m| m.downcase.tr('^lrsa','').split('')}
def strmeter
  Mfile.first
end
el = '[468]'
es = '[04]'
parens = lambda {|*args| "(#{args.join '|'})" }
Syll = %w{l s a r}.hashwith( [el,es,[el,es],[el,es*2]].map(&parens).group(%w{8 0 0 8}) )
def meter
  Regexp.new strmeter.join.gsub(/./) {|c| Syll[c][0]}
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
    v = fix4s(v).join
    l.gsub!(Vowel) {v.slice! 0,1} # slice! needs the join, to get exactly 1 char
  end
  [l[0..-2],v] # [0..-2] takes off the trailing '/'; puts will add the '\n'
end

Common = [/[68](?=\s*[ptkbdg]\/[lr])/,'4']

def workaline(s)
  ssc = workit(s)
  ssc =  ssc[1] ? ssc : workit(s.gsub(*Common))
  ssc[1] ? ssc[0] : ""
end

STDIN.each {|l| puts workaline(l); Mfile.rotfirst}
