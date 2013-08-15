class Array
  def indexedhash() (0...length).hashwith(self) end
  def zip2hash() Hash[*unpair] end
  def unpair() foldl([]) {|a,pair| a+pair} end
  def car() self[0] end
  def cdr() self[1..-1] end
  alias_method :old_mm, :method_missing
  def method_missing(sym, *args)
    missed = sym.id2name
    if missed =~ /^c[ad]+r$/
      eval 'self'+missed[1..-2].reverse.gsub(/./,'.c\&r')
    else
      old_mm(sym, *args)
    end
  end
end

module Enumerable
  def hashwith(other) group(other).zip2hash end
  def foldl(n)
    each {|x| n = yield(n,x)}
    n
  end   # thanks, matz.
  def group(*args)
    args = [self.to_a]+args
    (0..args[0].length-1).map {|i| args.map {|a| a[i] || a[-1]}}
  end
end

class String
  def match(rgx)
    rgx.match self
  end
end
