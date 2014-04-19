/[a-z]/ { print gensub("[^0-9LNH]","","g",gensub("@...?[0-9]","","g"))}
