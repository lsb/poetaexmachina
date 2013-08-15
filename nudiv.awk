{	cons = "[bcdfgjklmnpqrstvz]"
	cons_no_m = "[bcdfgjklnpqrstvz]"
	wordend = "[- !():;\"\'\`,.?]*"
	slash = "\\1/\\2"

	vv   = "([048])(h?%)"
	vcv1 = "([048])(" wordend cons "h?%)"
	vcv2 = "([048])(" cons_no_m wordend "h?%)"
	cc = "(" wordend cons "h?)(" wordend cons ")"

	$0=gensub(vv,slash,"g")
	$0=gensub(vcv1,slash,"g")
	$0=gensub(vcv2,slash,"g")
	$0=gensub("8" cc,8 slash,"g")
	$0=gensub("[04]" cc,6 slash,"g")
	print
}
