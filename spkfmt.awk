BEGIN { RS = "\0" }

{	gsub("/","")
	# punctuation -> space (+ vowel change)
	$0=gensub("%H([^[:space:]]*)!","%S\\1.","g")
	$0=gensub("%[LNH]([^%]*)\\?","%S\\1.","g")

	# don't have a low pitch right before a superhigh
	# current format:
	#		%[LNH].[068]

	$0 = gensub("%L([^%]*%S)","%N\\1","g")

	gsub(".","&/");
}
1
