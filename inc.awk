BEGIN {RS="\0"}
{	gsub(/%/,"%N")
	gsub(/$/," ");	gsub(/^/," ");	gsub(/\n/," \n ")
	gsub(/4/,"0")	# we'll see if this hurts later


	$0 = gensub("%N(..?[68][^% ]*%N[^% ]* )","%H\\1","g")
#			    /
#		    ...    --       x

	$0 = gensub("%N([^% ]*%N..?0[^% ]*%[^% ]* )","%H\\1","g")
#		      /
#		 ...  x         u      x

	$0 = gensub("( [^% ]*%)N([^% ]*%[^% ]* )","\\1H\\2","g")
#			      /
#			      x      x

	$0 = gensub("(/[^%/]*)%([^%/\n]*%)","\\1@\\2","g")

	$0 = gensub("%N([^%]*%H)","%L\\1","g")
	gsub(/ $/,"");	gsub(/^ /,""); gsub(/ \n /,"\n")
	print
}
