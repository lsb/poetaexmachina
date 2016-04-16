FROM ruby:2.3
RUN sed -i 's/$/ contrib non-free/' /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y sqlite3 gawk lame mbrola
COPY . /poetaexmachina
WORKDIR /poetaexmachina
RUN bundle install
EXPOSE 80
CMD ruby app.rb -p 80 -e production