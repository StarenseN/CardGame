# Function that generates a random number
randNum = ->
  return Math.floor(Math.random()*10)

# ---------------------------------------

if Meteor.isClient
  Session.setDefault 'random', randNum()

  # Template toBeat
  Template.toBeat.helpers
    random: -> Session.get 'random'

  Template.toBeat.events
    'click button': -> Session.set 'random', randNum()

  # Template dragCards
  Template.dragCards.helpers
    cardValue: -> Session.get 'cardValue'

  Template.dragCards.events
    'click button': -> Session.set 'cardValue', randNum()


  Template.dragCards.onRendered ->
    dragula([
      document.querySelector('#card')
      document.querySelector('#arena')
    ])

    .on 'drop', (el) ->
      Session.set 'arenaValue', Session.get 'cardValue'
      el.className += ' ex-moved'
      console.log(Session.get('arenaValue'))
      console.log(Session.get('random'))
      if Session.get('arenaValue') > Session.get('random')
        console.log 'you win'
        $('h1#message').text("You win !")
      console.log 'element dropped'




# ---------------------------------------

if Meteor.isServer
  console.log 'This code runs on server'
  console.log randNum()