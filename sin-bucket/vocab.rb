require 'open-uri'
def method_missing word
 w = 'http://www.perseus.org/cgi-bin/morphindex?lang=la&embed=2&lookup='
 tbl = /<foreign lang="la">(.*?)<.foreign><.G><.font><.td><td>(.*?)<.td>/
 puts ''
 open(w+word.to_s).read.scan(tbl).each{ |wdef|
   puts "#{wdef[0]}: #{wdef[1]}" unless wdef[1].include? 'href'
 }
 puts ''
end
