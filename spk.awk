BEGIN	{
	RS="/"
	pause[","]=100
	pause[":"]=200
	pause[";"]=250
	pause["."]=800

	raise[","]=.15
	raise[":"]=.25
	raise[";"]=.4

	lenth["cons"]=81
	lenth[0]=91
	lenth[6]=lenth[8]=151

	hitone=histart=110
	lotone=lostart=80
	histep=2.5
	lostep=2.5

	highest=120
	lowest=40	# roughly a ninth

	vowel["a0"]="A"
	vowel["a8"]="A2"
	vowel["e0"]="E1"
	vowel["e8"]="E2"
	vowel["i0"]="I"
	vowel["i8"]="I2"
	vowel["o0"]="O1"
	vowel["o8"]="O2"
	vowel["u0"]="U"
	vowel["u8"]="U2"

	cons["b"]="B"
	cons["c"]="K"
	cons["d"]="D"
	cons["f"]="F"
	cons["g"]="G"
	cons["h"]="h 10\n;H"
	cons["j"]="J"
	cons["k"]="K"
	cons["l"]="L"
	cons["m"]="M"
	cons["n"]="N"
	cons["p"]="P"
	cons["q"]="q"
	cons["r"]="R"
	cons["s"]="S"
	cons["t"]="T"
	cons["v"]="W"
	cons["z"]="Z"
}

{ print "\t\t;", $0 }

/[bcdfghjklmnpqrstvz]/	{ print cons[$0], lenth["cons"] }

/\n/	{ if (NR != 1) { print "_", pause[","]/2 } }

/[,:;.]/{
print "_",pause[$0],0,lowest,50,hitone
NR = 0
}

/[,:;]/	{
	print ";;;lo", lotone, "hi", hitone
	del = (highest-hitone)*raise[$0]
	hitone += del
	lotone += del
#	lotone = hitone - (histart - lostart)
	print ";;;lo", lotone, "hi", hitone
}

/[.]/	{
	hitone=histart; lotone=lostart
}

/[%]/	{
#				our vowels look like
#				%[LNHS].[068]
	getline lnhs
	getline dot
	getline ohsixeight
	fullvowel = dot ohsixeight
	gsub("6","0",fullvowel)
	print ";;" lnhs ";" dot ";" ohsixeight ";" fullvowel ";;"
	mbrolavowel = vowel[fullvowel]
	mbrolalen = lenth[ohsixeight]
	mbrolapitch = ""

	print ";lo", lotone, "hi", hitone, "lofloor", lowest, "hiceil", highest
	if (lnhs == "L") {
		mbrolapitch = "50 " lotone
		lotone -= lostep
		if (lotone < lowest) {
			lotone = lowest
		}
	}
	if (lnhs == "H") {
		mbrolapitch = "50 " hitone
		hitone -= histep
		if (hitone < lotone) {
			hitone = lotone
		}
	}
	if (lnhs == "S") {
		mbrolapitch = "99 " 0.5*(hitone+highest)
	}
	print ";lo", lotone, "hi", hitone, "lofloor", lowest, "hiceil", highest
	print ""
	print mbrolavowel, mbrolalen, mbrolapitch
}
