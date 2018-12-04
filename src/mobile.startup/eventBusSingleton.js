/**
 * T156186: Please make judicious use of this singleton whose purpose is to
 * allow disparate components the ability to subscribe to a set of events and
 * react to those events.
 *
 * Prefer to use a more localized event bus when possible. (e.g.
 * mobile.special.nearby.scripts/nearby.js in Change-Id:
 * I632124515d4c26ae5ce77dd503d00a62e5a65dda)
 *
 * Only import this in files at the edges. For example:
 *
 * Good: initialization scripts responsible for initializing classes such as
 * mobile.init/init.js
 * Bad: ImageOverlay.js or in any other component.
 *
 * By doing this, and using dependency injection of the event bus in the
 * components themselves, it will make it easier to switch this event bus out
 * for something more localized later on in our refactoring efforts.
 */
module.exports = new OO.EventEmitter();
