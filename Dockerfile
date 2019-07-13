FROM ruby
RUN sed -i 's/$/ contrib non-free/' /etc/apt/sources.list
RUN apt-get update && \
    apt-get install -y sqlite3 gawk lame mbrola && \
    rm -rf /var/lib/apt/lists/*
COPY . /poetaexmachina
WORKDIR /poetaexmachina
RUN bundle install
CMD ruby app.rb -p 3000 -e production
