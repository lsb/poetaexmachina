
BEGIN {oldrs=RS;newrs=RS="[a-zA-Z]+";ORS=""}

{
	gsub(/[^-@#,.;:!? \n]/,"")
	sub(/[\n]/,"~");gsub(/[\n]/,"");sub(/~/,"\n");sub(/ /,"")
	if (RT !~ /[a-zA-Z]/) {printf("%s", $0); next}

	### take out all the shitpunctuation we don't need (and line #s)

		print "~~~"
	artie=RT
	nomen = artie ".lemma"
#	RS = oldrs
#	getline lil < nomen
#	RS = newrs
#	close(nomen)
#	if (lil !~ /[aeiou]/) {
		system("test -s " nomen " || ./mrj " artie)
		RS = oldrs
		getline lil < nomen
		RS = newrs
		close(nomen)
#	}
		print "~~~"
	sally = lil
	gsub(/[^a-zA-Z]/,"",sally)
	gsub(/q/,"qu",sally); gsub(/cs/,"x",sally); gsub(/dz/, "z", sally)
	interregnum = length(artie)-length(sally)

	

	if (interregnum == 0) {
#		printf("%s","[" $0 "]{" lil "}")
		printf("%s",$0 lil)
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
		suf = substr(artie,1+length(sally))
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
#		printf("%s","_" $0 "_~" lil "~<" suf ">")
		printf("%s",$0 lil tolower(suf))
	}


}
