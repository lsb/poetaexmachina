BEGIN {FS="<th><foreign lang=\"la\">";RS="</foreign></th>";ORS="|";print}

####### ### vowels are /%..?[08]/; unmarked vowels are short ### ########

$2 != "" {

	$0=tolower($2)
	gsub(/k/,"c");gsub(/qu/,"q");gsub(/x/,"cs");gsub(/z/,"dz")
	gsub(/y/,"i");gsub(/&/,"%");gsub(/circ;/,"8")
	gsub(/.[_^]/,"%&");gsub(/\^/,"0");gsub("_","8")

	gsub(/ae/,"%AE8");gsub(/%a/,"%A")
	gsub(/au/,"%AU8");gsub(/%e/,"%E")
	gsub(/ei/,"%EI8");gsub(/%i/,"%I")
	gsub(/eu/,"%EU8");gsub(/%o/,"%O")
	gsub(/oe/,"%OE8");gsub(/%u/,"%U")
	gsub(/ui/,"%UI8");gsub(/[aeiou]/,"%&0")
	print tolower($0)
}
