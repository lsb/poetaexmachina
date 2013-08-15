require 'sinatra'
require './synth'

get('/') {
  erb :index, :locals => {}
}
get('/synth') {
  text = params["text"].to_s
  meter = params["meter"].to_s.downcase.tr('^lrsa/', '')
  redirect '/' if text.empty? || meter.tr('/','').empty?
  html, _ = *PoetaExMachina.synth(text, meter, false)
  mp3_link = request.fullpath.sub(%r{^/synth}, "/mp3")
  erb :synth, :locals => {:macronized => html,
                          :mp3_link => mp3_link}
}
get('/mp3') {
  text = params["text"]
  meter = params["meter"]
  _, mp3 = *PoetaExMachina.synth(text, meter, true)
  content_type "audio/mpeg"
  mp3
}
