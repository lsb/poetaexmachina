puts eval(gets).map {|a| a[2..-1]}.flatten.uniq.map {|s| %Q%<th><foreign lang="la">#{s}</foreign></th>%}
#(scansions == []) ? exit(87) : puts scansions
