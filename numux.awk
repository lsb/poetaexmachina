
BEGIN   {RS="[^0-9a-z%|]+";FS="";ORS=""}

{

if ($0 ~ /\|/) {
        gsub(/\|/,"@!")
        $0 = "!" $0 "@"
        while ($0 !~ /!@/) {
                $0 = gensub(/!([^08@]+)/,"\\1!","g")

                if ($0 ~ /!0/ && $0 ~ /!8/)
                        gsub(/![08]/,"4!")
                else
                        $0 = gensub(/!([08])/,"\\1!","g")
        }
        gsub(/!@.*$/,"");gsub(/^.*@/,"")
}
print $0 RT

}
