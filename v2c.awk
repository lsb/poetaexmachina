{
	$0= " " $0
        $0=gensub(/([gs])%u0%/,"\\1v%","g")
        $0=gensub(/([08])%i0%/,"\\1j%","g")
	gsub(/ %i0%u/," j%u")
	gsub(/eu8n/,"e0%u0n")
	$0=gensub(/([^cChH])%ui8/,"\\1%u0%i8","g")
	gsub(/^ /,"")
        print
}
