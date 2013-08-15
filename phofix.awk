BEGIN {RS="\0"; conslen=81; crlf="([^\n]*\n)"; newlen = 2*conslen "\n"}
{
	novoice = crlf "([KFPST])" crlf
	$0 = gensub("B" novoice, "P\\1\\2\\3","g")
	$0 = gensub("D" novoice, "T\\1\\2\\3","g")
	#$0 = gensub("N" crlf "([KG])","ng\\1_ 1\n\\2","g")
	#$0 = gensub("G" crlf "N","ng\\1_ 1\nN","g")

	$0 = gensub("q" crlf,"K " conslen "\nW " conslen/2 "\n","g") 
	$0 = gensub("K" crlf "K" crlf,"K " newlen,"g")
	$0 = gensub("P" crlf "P" crlf,"P " newlen,"g")
	$0 = gensub("T" crlf "T" crlf,"T " newlen,"g")
	$0 = gensub("G" crlf "G" crlf,"G " newlen,"g")
	$0 = gensub("B" crlf "B" crlf,"B " newlen,"g")
	$0 = gensub("D" crlf "D" crlf,"D " newlen,"g")
	$0 = gensub("S" crlf "S" crlf,"S " newlen,"g")
	$0 = gensub("F" crlf "F" crlf,"F " newlen,"g")
	$0 = gensub("M" crlf "M" crlf,"M " newlen,"g")
	$0 = gensub("N" crlf "N" crlf,"N " newlen,"g")
	$0 = gensub("L" crlf "L" crlf,"L " newlen,"g")
	$0 = gensub("R" crlf "R" crlf,"R " newlen,"g")

	#gsub("h" crlf "_", "_")
	#$0 = gensub("_" crlf "h" crlf, "_\\1", "g")
	$0 = gensub("([TP])" crlf "h", "\\1\\2_", "g")
	gsub("h",";")

	$0 = gensub("D" crlf "E1","D\\1E","g")
	$0 = gensub("U(2?)" crlf "T ","U\\1\\2_ 1\nT ","g")
	$0 = gensub("W" crlf "(M|L)","U\\1\\2","g")
}
1
