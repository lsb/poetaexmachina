{
	gsub(/ae/,"ai")
	$0=gensub("%([LNH])(.)(.)([0468])","%\\1\\2\\4%N\\30","g")
	$0=gensub("(@[^ ]*)m","\\1M","g")
}
1
