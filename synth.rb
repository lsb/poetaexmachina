require 'tmpdir'
def run_rw_pipe(command, stdin)
  IO.popen(command,"wb+") {|pipe| pipe.write(stdin); pipe.close_write; pipe.read }
end
def new_tmp_path
  Dir.tmpdir() + '/' + Kernel.rand().to_s
end

class PoetaExMachina
  def self.raw_text_to_accentuated_scanned_intermediate(text, meter)
    sanitized_meter = meter.tr('^lrsa/','')[0,100]
    pipeline = "gawk -f amp.awk | gawk -f mrj.awk | gawk -f unamp.awk | gawk -f postamp.awk | gawk -f nudiv.awk | ruby scansion.rb #{sanitized_meter} | gawk -f inc.awk"
    run_rw_pipe(pipeline, text)
  end
  def self.accentuated_scanned_intermediate_to_formatted_html(intermediate)
    pipeline = "gawk -f htmfmt.awk"
    run_rw_pipe(pipeline, intermediate).split("\n").join("<br>")
  end
  def self.accentuated_scanned_intermediate_to_mbrola_pho(intermediate)
    pipeline = "gawk -f d2m.awk | gawk -f spkfmt.awk | gawk -f spk.awk | gawk -f phostrip.awk | gawk -f phobunc.awk | gawk -f phofix.awk"
    run_rw_pipe(pipeline, intermediate)
  end
  def self.pho_to_mp3(pho)
    pho_tmp = new_tmp_path
    wav_tmp = new_tmp_path + ".wav"
    mp3_tmp = new_tmp_path + ".mp3"
    pipeline = "cat - > #{pho_tmp}; ./mbrola-linux-i386 -f 2.1 -l 15000 -t 1.2 i #{pho_tmp} #{wav_tmp}; lame --quiet -b 40 -m m -q 7 --noreplaygain --resample 22.05 -t #{wav_tmp} #{mp3_tmp} ; cat #{mp3_tmp}"
    mp3 = run_rw_pipe(pipeline, pho)
    File.delete(pho_tmp, wav_tmp, mp3_tmp)
    mp3
  end
  def self.synth(text, meter, full_mp3 = true)
    asi = self.raw_text_to_accentuated_scanned_intermediate(text, meter)
    html = self.accentuated_scanned_intermediate_to_formatted_html(asi)
    [html, full_mp3 ? self.pho_to_mp3(self.accentuated_scanned_intermediate_to_mbrola_pho(asi)) : nil]
  end
end
