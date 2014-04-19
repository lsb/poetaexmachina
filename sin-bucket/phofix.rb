conslen=81
crlf="([^\n]*\n)"
newlen = "#{2*conslen}\n"
novoice = "#{crlf}([KFPST])#{crlf}"
all = STDIN.read
plosive_devoice = all.gsub(/B#{novoice}/,"P\\1\\2\\3").gsub(/D#{novoice}/,"T\\1\\2\\3")
q_decomposition = plosive_devoice.gsub(/q#{crlf}/, "K #{conslen}\nW #{conslen/2}\n")
stop_lengthening = q_decomposition.gsub(/([KPTGBDSFMNLR])#{crlf}\1#{crlf}/,"\\1 #{newlen}")
aspiration_kludge = stop_lengthening.gsub(/([TP])#{crlf}h/,"\\1\\2_")
rough_breathing_removal = aspiration_kludge.gsub(/h/,';')
deficiencies_in_IT4 = rough_breathing_removal.gsub(/D#{crlf}E1/,"D\\1E").gsub(/U(2?)#{crlf}T /,"U\\1\\2_ 1\nT ").gsub(/W#{crlf}(M|L)/,"U\\1\\2")
print deficiencies_in_IT4
