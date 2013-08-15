### vowel format: %[LNH]..?[068]

{	gsub("/","");gsub("q","qu");gsub("dz","z");gsub("cs","x")
	$0=gensub("@([^%]*%[LNH]..?[068])","<u>%\\1</u>","g")
	$0=gensub("%[LNH](.)8","\\&\\1circ;","g")
	$0=gensub("%[LNH](..?)[068]","\\1","g")
}
1
