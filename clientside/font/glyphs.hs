module Glyphs where

import System

height = size . gl

xheight = size (gl "i")

blank = (`replicate` " ")

gl "_" = blank 18

gl "_2" = map ("  " `const`) (gl "_")

gl "per" = gl "1"

gl "com" =     [" *",
		" *",
		"* ",
		"* "]

gl "aps" =     ["*",
		"*",
		"*"] `putAtop` blank xheight

gl "col" = gl "per" ++ blank (xheight - height "per")

gl "que" = (gl "per" `putAtop` blank (xheight - height "per" - 3)) `putAtop` (gl "com")


gl "j" = gl "_"
gl "j5" = gl "5" `putAtop` blank xheight
gl ('j':accent) | isSubscripted accent = gl ('j' : desubscript accent)
		| otherwise = combo "w" accent `putAtop` blank (xheight-2)

gl "b" =       [" **** ",
		"*    *",
		"*    *",
		"*    *",
		"* *** ",
		"*    *",
		"*    *",
		"*    *",
		"***** ",
		"*     ",
		"*     ",
		"*     "]

gl "b2" =      ["****  ",
		"*   * ",
		"*   * ",
		"*   * ",
		"***** ",
		"*    *",
		"*    *",
		"*    *",
		"***** "]

gl "g" =       ["*     *",
		"*     *",
		" *   * ",
		" *   * ",
		"  * *  ",
		"  * *  ",
		"   *   ",
		"   *   ",
		"   *   ",
		"   *   "]

gl "g2" =      ["******",
		"*     ",
		"*     ",
		"*     ",
		"*     ",
		"*     ",
		"*     ",
		"*     ",
		"*     "]

gl "d" =       [" **** ",
		"  *   ",
		"   *  ",
		" **** ",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		" **** "]

gl "d2" =      ["   *   ",
		"   *   ",
		"  * *  ",
		"  * *  ",
		" *   * ",
		" *   * ",
		"*     *",
		"*     *",
		"*******"]


gl "z" =       [" ****",
		"   * ",
		"  *  ",
		" *   ",
		" *   ",
		"*    ",
		"*    ",
		"*    ",
		"*    ",
		" *** ",
		"    *",
		"    *",
		"   * "]

gl "z2" =      ["*******",
		"      *",
		"     * ",
		"    *  ",
		"   *   ",
		"  *    ",
		" *     ",
		"*      ",
		"*******"]

gl "q" =       [" **** ",
		"*    *",
		"*    *",
		"*    *",
		"******",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		" **** "]

gl "q2" =      ["  ****  ",
		" *    * ",
		"*      *",
		"*      *",
		"* **** *",
		"*      *",
		"*      *",
		" *    * ",
		"  ****  "]

gl "k" =       ["*   **",
		"*  *  ",
		"* *   ",
		"***   ",
		"*  *  ",
		"*   * ",
		"*    *"]

gl "k2" =      ["*    *",
		"*   * ",
		"*  *  ",
		"* *   ",
		"**    ",
		"* *   ",
		"*  *  ",
		"*   * ",
		"*    *"]

gl "l" =       ["  *   ",
		"  *   ",
		"  *   ",
		"  **  ",
		"  **  ",
		" *  * ",
		" *  * ",
		" *  * ",
		"*    *",
		"*    *"]

gl "l2" =      ["   *   ",
		"   *   ",
		"  * *  ",
		"  * *  ",
		" *   * ",
		" *   * ",
		" *   * ",
		"*     *",
		"*     *"]


gl "m" =       ["*    *",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		"*   **",
		"**** *",
		"*     ",
		"*     ",
	 	"*     "]

gl "m2" =      ["**     **",	
		"**     **",
		"* *   * *",
		"* *   * *",
		"*  * *  *",
		"*  * *  *",
		"*   *   *",
		"*   *   *",
		"*       *"]

gl "n" =       ["*    *",
		"*    *",
		"*    *",
		" *  * ",
		" *  * ",
		"  **  ",
		"  **  "]

gl "n2" =      ["**    *",
		"**    *",
		"* *   *",
		"* *   *",
		"*  *  *",
		"*   * *",
		"*   * *",
		"*    **",
		"*    **"]

gl "c" =       ["***** ",
		"  *   ",
		" *    ",
		" *    ",
		"  *** ",
		" *    ",
		"*     ",
		"*     ",
		"*     ",
		" **** ",
		"     *",
		"     *",
		"    * "]

gl "c2" =      ["******",
		"      ",
		"      ",
		"      ",
		" **** ",
		"      ",
		"      ",
		"      ",
		"******"]

gl "p" =       ["******",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		"*    *"]

gl "p2" =      ["*******",
		"*     *",
		"*     *",
		"*     *",
		"*     *",
		"*     *",
		"*     *",
		"*     *",
		"*     *"]

gl "r" =       [" **** ",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		"***** ",
		"*     ",
		"*     ",
		"*     "]

gl "r2" =      ["***** ",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		"***** ",
		"*     ",
		"*     ",
		"*     "]

gl "s" =       [" ******",
		"*   *  ",
		"*    * ",
		"*    * ",
		"*    * ",
		"*    * ",
		" ****  "]

gl "s1" =      ["  ****",
		" *    ",
		"*     ",
		"*     ",
		"*     ",
		"*     ",
		" **** ",
		"     *",
		"     *",
		"    * "]

gl "s2" =      ["*******",
		"*      ",
		" *     ",
		"  *    ",
		"   *   ",
		"  *    ",
		" *     ",
		"*      ",
		"*******"]

gl "t" =       ["*****",
		"  *  ",
		"  *  ",
		"  *  ",
		"  *  ",
		"  *  ",
		"  *  "]

gl "t2" =      ["*******",
		"   *   ",
		"   *   ",
		"   *   ",
		"   *   ",
		"   *   ",
		"   *   ",
		"   *   ",
		"   *   "]

gl "f" =       ["   *   ",
		"   *   ",
		" ***** ",
		"*  *  *",
		"*  *  *",
		"*  *  *",
		"*  *  *",
		"*  *  *",
		" ***** ",
		"   *   ",
		"   *   ",
		"   *   "]

gl "f2" =      ["    *    ",
		"  *****  ",
		" *  *  * ",
		"*   *   *",
		"*   *   *",
		"*   *   *",
		" *  *  * ",
		"  *****  ",
		"    *    "]

gl "x" =       ["*    *",
		"*    *",
		" *  * ",
		" *  * ",
		"  **  ",
		"  **  ",
		" *  * ",
		" *  * ",
		"*    *",
		"*    *"]

gl "x2" =      ["*     *",
		"*     *",
		" *   * ",
		"  * *  ",
		"   *   ",
		"  * *  ",
		" *   * ",
		"*     *",
		"*     *"]

gl "y" =       ["*   *   *",
		"*   *   *",
		"*   *   *",
		"*   *   *",
		"*   *   *",
		" *  *  * ",
		"  *****  ",
		"    *    ",
		"    *    ",
		"    *    "]

gl "y2" = map allButLast $ gl "y"

gl "a2" =      ["   *   ",
		"   *   ",
		"  * *  ",
		"  * *  ",
		" *   * ",
		" *   * ",
		" ***** ",
		"*     *",
		"*     *"]

gl "e2" =      ["******",
		"*     ",
		"*     ",
		"*     ",
		"******",
		"*     ",
		"*     ",
		"*     ",
		"******"]

gl "h2" =      ["*     *",
		"*     *",
		"*     *",
		"*     *",
		"*******",
		"*     *",
		"*     *",
		"*     *",
		"*     *"]

gl "i2" =      ["***",
		" * ",
		" * ",
		" * ",
		" * ",
		" * ",
		" * ",
		" * ",
		"***"]

gl "o2" =      ["  ****  ",
		" *    * ",
		"*      *",
		"*      *",
		"*      *",
		"*      *",
		"*      *",
		" *    * ",
		"  ****  "]

gl "u2" =      ["*     *",
		" *   * ",
		" *   * ",
		"  * *  ",
		"  * *  ",
		"   *   ",
		"   *   ",
		"   *   ",
		"   *   "]

gl "w2" =      ["  *****  ",
		" *     * ",
		"*       *",
		"*       *",
		"*       *",
		"*       *",
		" *     * ",
		"  *   *  ",
		"***   ***"]

gl "a" =       [" *** *",
                "*   **",
                "*    *",
                "*    *",
                "*    *",
                "*   **",
                " *** *"]


gl "e" =       [" ****",
		"*    ",
		"*    ",
		"*****",
		"*    ",
		"*    ",
		" ****"]

gl "h" =       ["* *** ",
                "**   *",
                "*    *",
                "*    *",
                "*    *",
                "*    *",
                "*    *",
                "     *",
                "     *",
                "     *"]

gl "i" = replicate 7 "*"

gl "o" =       [" **** ",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		"*    *",
		" **** "]

gl "u" =  (second (gl "o")) ++ (tail (gl "o"))

gl "w" =       [" *     * ",
		"*       *",
		"*   *   *",
		"*   *   *",
		"*   *   *",
		"*   *   *",
		" *** *** "]

gl "5" =       [" *",
		" *",
		"* ",
		"* "]

gl "5solo" =  leftpad 1 $ gl "5"

gl "5mini" =   gl "5"

gl "9old" =       [" **",
		"*  ",
		"*  ",
		" **"]

gl "9" = gl "9mini"

gl "6" =       [" ** ",
		"*  *"]

gl "6b" = map (\x -> take 2 x ++ drop 1 x) $ gl "6"
  where doublesecond x = take 2 x ++ drop 1 x

gl "6mini" =   [" * ",
		"* *",
		"* *"]

gl "96" =      [" **** ",
		"* *  *",
		"  *   ",
		"   ** "]

gl "1" =       ["*",
		"*"]

gl "3" =       ["*  *"]

gl "35" =      ["   *",
		"  * ",
		"    ",
		"*  *"]

gl "36" = (gl "6") `putAtop` (gl "3")

gl full@('3':maybemini) | maybemini == "mini" || tail maybemini == "mini" =  map (\x -> first x ++ drop 2 x) (gl (filter (`elem` diacr) full))

gl ('3':'7':qqch) = mirror (gl ('3':'5':qqch))

gl ('3':qqch) | 'b' `elem` qqch = map (\x -> take 2 x ++ drop 1 x) (gl $ '3':allButLast qqch)

gl "96mini" =  ["  ** ",
		" ** *",
		" *   ",
		"  ** "]
--gl "96"

gl "9mini" = map allButLast (gl "9old")

gl jumbo | isSubscripted jumbo = let	name = desubscript jumbo ; raw = gl name ; blankline = replicate (girth raw) ' '
				        filled = fillDescender name
					ss = snd (equisize filled (rightpad (if head jumbo == 'h' then 1 else 0) $ gl "1"))
					bigss = replicate (size filled - size (gl "1")) blankline ++ ss
				 in zipWith (zipWith (\a b -> if a=='*' || b=='*' then '*' else ' ')) filled bigss

gl (sz:qqch) | sz `elem` "70" = mirror $ gl ((if sz=='7' then '5' else '9'):qqch)

gl (vow:accs) | vow `elem` alphabet && all (`elem` diacr) accs = composeAcc (enlist vow) (combo (enlist vow) accs)
-- accs does not have a subscript.


gl _ = trouble

combo "w" (q:qqch) | q == '3' || q == '6' = gl (q:qqch ++ "b")
combo "i" accs	| gl accs /= trouble = leftpad (if accs == "5" || accs == "0" then 1 else 0) (gl (accs ++ "mini"))
combo vow "9" = rightpad 1 (gl "9")
combo vow fs | fs == "5" || fs == "7" = gl (fs ++ "solo")
combo vow accs	| gl accs /= trouble = gl accs
		| all (`elem` "9057") accs = let acc x y = putAside (gl (first accs ++ y)) (gl (second accs ++ x))
						 toobig x y = girth (gl vow) < girth (acc x y)
						 resize x = if toobig x "" then "mini" else ""
						in acc (resize "") (resize "mini")
		| otherwise 		= (gl vow) ++ [" combined with "] ++ (if (gl accs)==trouble then [accs] else gl accs)

first = enlist . (!! 0)
second = enlist . (!! 1)

composeAcc vow = (`putAtop` (gl vow))

putAside = zipWith ((++) . (++ " "))

putAtop ac v = let (acq,vq) = equisize ac v
		in acq ++ enlist (replicate (girth acq) ' ') ++ vq

equisize ac v	| bigness<0  =  ((pad (-bigness) ac),v)
		| otherwise  =	(ac,(pad bigness v))
  where bigness = girth ac - girth v

girth = size . head

pad n = (leftpad (n - kern)) . (rightpad kern)
  where kern = div n 2
rightpad n = map (++ (replicate n ' '))
leftpad n  = map ((replicate n ' ') ++)


allButLast (_:[]) = []
allButLast (x:xs) = x : allButLast xs
-- take (size lst - 1) lst

mirror = map reverse

isSubscripted = ('1' ==) . last
desubscript = allButLast
-- class String; def desubscript() gsub(/.$/,'') end end
-- or even desubscript = filter (/= '1')

enlist = (: [])
delist = head
size = length

alphabet = "abgdezhqiklmncoprstufxyw"
diacr = "903567"

isDescending ('i':_) = False
isDescending ('j':_) = False
isDescending (_:'2':_) = False
isDescending "t" = False
isDescending "x" = True
isDescending "per" = False
isDescending letter | isSubscripted letter = True
isDescending others = hasDescender $ gl others
hasDescender glyph = 1 == size (filter (== '*') (last glyph))
fillDescender glname = if isDescending glname then glyph else glyph ++ replicate 3 (replicate (girth glyph) ' ')
	where glyph = gl glname

tr fromc toc = \x -> if x==fromc then toc else x
polytr from to str = foldl (flip map) str $ zipWith tr from to

unspace = filter (/= ' ')

ppmheader glyph = "P1 " ++ (show $ girth glyph) ++ " " ++ (show $ size glyph) ++ "\n"
rasterize glyph = unlines $ map (polytr " *" "01") glyph
ppmify glname = ppmheader glyph ++ rasterize glyph
	where glyph = fillDescender glname

trouble = ["abba"]

see = seee . gl
seee = putStr . unlines

smooshedLeft = smooshed head
smooshedRight = smooshed last
smooshed whence glyph = size glyph `div` 4 < foldr ((+).boolToInt.(== '*').whence) 0 glyph
-- i'd like to see the glyph chopped to the x-height.
boolToInt False = 0
boolToInt True = 1


writeLetter name = let filename = name ++ ".ppm" in writeFile filename (ppmify name) >> putStrLn ("wrote " ++ filename)
appendBat name = system bat >> return ()
		where bat = "ppmtobmp " ++ name ++ ".ppm > " ++ name ++ ".bmp"
jsKernStr name = leftKern ++ rightKern
	where	leftKern = kern smooshedLeft (++name)
		rightKern = kern smooshedRight  (name++)
		xchg = if girth (gl name) > 2 + girth (gl (first name)) then "~" else ""
		kern space uscore = if space (gl name) then "" else "[/" ++ uscore "_" ++ "/g,'" ++ uscore xchg ++ "'],\n"
allLetters = "_" : "_2" : "per" : "aps" : "col" : "que" : "com" : "r9" : "s1" : [le:tter | le <- alphabet, tter <- ["2",""]] ++ [unspace (l:b:a:s:[]) | l <- "aeiouhwj", b <- "903 ", a <- "567 ", s <- "1 "] 
workit = writeFile "kernings" "" >> mapM_ (\n -> mapM_ ($ n) [writeLetter,appendBat,appendFile "kernings" . jsKernStr]) allLetters >> putStr (replicate 10000 '\a')