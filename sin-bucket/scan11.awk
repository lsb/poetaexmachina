BEGIN {FS="/";OFS="/"}

{
	###     3 4 5 6 7 8 9 10
	### x x - u u - u - u - x
	###
	### with something like soles occidere et redire,
	### we leave it as 4, and prosody splits the difference.

	$3  = gensub(/[04]([^%]*)$/,"8\\1","g",$3)
	$6  = gensub(/[04]([^%]*)$/,"8\\1","g",$6)
	$8  = gensub(/[04]([^%]*)$/,"8\\1","g",$8)
	$10 = gensub(/[04]([^%]*)$/,"8\\1","g",$10)
	 $4 = gensub(/[468]([^%]*)$/,"0\\1","g",$4)
	 $5 = gensub(/[468]([^%]*)$/,"0\\1","g",$5)
	 $7 = gensub(/[468]([^%]*)$/,"0\\1","g",$7)
	 $9 = gensub(/[468]([^%]*)$/,"0\\1","g",$9)
	print
}
