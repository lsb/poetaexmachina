
BEGIN {oldrs=RS;newrs=RS="[a-zA-Z]+";ORS="";db="sqlite3 merged-scansions.db";fudge="gawk -f nufec.awk|gawk -f premux.awk|gawk -f numux.awk|gawk -f v2c.awk"}

{
	gsub(/[^-@#,.;:!? \n]/,"")
	sub(/[\n]/,"~");gsub(/[\n]/,"");sub(/~/,"\n");sub(/ /,"")
	if (RT !~ /[a-zA-Z]/) {printf("%s", $0); next}

	### take out all the punctuation we don't need (and line #s)

	print "~~~"
	text_word = RT
	RS = oldrs
	print "select scansion from merged_scansions where word = '" text_word "' union all select '' limit 1;\n" |& db
	db |& getline multiplexed_scansion
	if (multiplexed_scansion == "") {
	    print "<th><foreign lang=\"la\">" text_word "</foreign></th>" |& fudge
	    close(fudge, "to")
	    fudge |& getline multiplexed_scansion
	    close(fudge)
	}
	RS = newrs
	print "~~~"
	rehydrated_word = multiplexed_scansion
	gsub(/[^a-zA-Z]/,"",rehydrated_word)
	gsub(/q/,"qu",rehydrated_word); gsub(/cs/,"x",rehydrated_word); gsub(/dz/, "z", rehydrated_word)
	interregnum = length(text_word)-length(rehydrated_word)

	

	if (interregnum == 0) {
#		printf("%s","[" $0 "]{" multiplexed_scansion "}")
		printf("%s",$0 multiplexed_scansion)
	} else {
		### todo: something smart with -qe/-ve/-ne for d6
		###
		### for now, we simply have code lifted from fetch
		### to put the vowel markers into the suffix.
		###
		### i suppose i'd really like another if clause
		### to check if we've got a q/v/n suffix,
		### and to then stick {q|v|n}%e0 on the end.
		### but with isosyllabics, that's irrelevant.
		suf = substr(text_word,1+length(rehydrated_word))
		gsub(/k/,"c",suf);gsub(/qu/,"q",suf)
		gsub(/x/,"cs",suf);gsub(/z/,"dz",suf)
		gsub(/y/,"i",suf);gsub(/&/,"%",suf)
		gsub(/circ;/,"8",suf);gsub(/\^/,"0",suf)
		gsub(/ae/,"%AE8",suf);gsub(/%a/,"%A",suf)
		gsub(/au/,"%AU8",suf);gsub(/%e/,"%E",suf)
		gsub(/ei/,"%EI8",suf);gsub(/%i/,"%I",suf)
		gsub(/eu/,"%EU8",suf);gsub(/%o/,"%O",suf)
		gsub(/oe/,"%OE8",suf);gsub(/%u/,"%U",suf)
		gsub(/ui/,"%UI8",suf)
		gsub(/[aeiou]/,"%&0",suf)
#		printf("%s","_" $0 "_~" multiplexed_scansion "~<" suf ">")
		printf("%s",$0 multiplexed_scansion tolower(suf))
	}


}
