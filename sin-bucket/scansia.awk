/[a-z]/ { print gensub("[^0-9 ]","","g",gensub("@...?[0-9]","","g"))}
