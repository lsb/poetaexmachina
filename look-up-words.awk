BEGIN { db = "sqlite3 latin.db" }
{
  print "select headwords from lemmatizations where word = '" $0 "';" |& db
  db |& getline h
  print h
}