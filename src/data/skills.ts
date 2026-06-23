// src/data/skills.ts
// All four domains — Phase 1a complete skill tree
// 84 skills across PM / CO / LC / SE
//
// Cross-domain dependency notes:
//   LC007 (Joint Attention) requires SE003 (Social Smiling) — intentional cross-domain link
//   "trunk strength", "balance control", "leg strength", "memory" from source data are
//   not standalone skills; they are absorbed as implied prerequisites of the skill that
//   first demands them (PM004, PM007, PM011, CO012 respectively).
//
// Do NOT author `unlocks[]` — it is derived at runtime by inverting `requires[]`.
//
// Tier/row invariant: all requires[] edges must point from a lower tier to a higher tier
// (same-tier edges produce degenerate bezier curves in the tree layout). Rows are
// 1-based lanes within a domain — no cross-domain row sharing.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SkillDomain =
  | 'physical_motor'
  | 'cognitive'
  | 'language_communication'
  | 'social_emotional'

export type SkillCategory =
  // Physical & Motor
  | 'gross_motor'
  | 'fine_motor'
  | 'object_manipulation'
  | 'self_care'
  // Cognitive
  | 'attention'
  | 'causal_reasoning'
  | 'memory'
  | 'imitation'
  | 'problem_solving'
  | 'symbolic'
  // Language & Communication
  | 'receptive_language'
  | 'expressive_language'
  | 'pragmatics'
  | 'vocalization'
  // Social & Emotional
  | 'social_bonding'
  | 'emotional_expression'
  | 'emotional_regulation'
  | 'self_awareness'
  | 'social_interaction'

export interface Skill {
  id: string
  name: string
  domain: SkillDomain
  category: SkillCategory
  tier: number   // column in the domain tree — all requires[] must be in a lower tier
  row: number    // lane within the domain tree — 1-based, scoped per domain

  requires: string[]       // hard prerequisites — must be acquired first
  strengthens: string[]    // soft supports — helps but does not gate

  milestone: boolean
  evidence: string[]

  typical_age_months: {
    start: number
    end: number
  }
}

// ===========================================================================
// PHYSICAL & MOTOR  (PM001 – PM024)
// 9 tiers — cascade from PM008 requiring same-tier PM006 in the original data
// ===========================================================================

// --- Tier 1 — Foundations --------------------------------------------------

const PM001: Skill = {
  id: 'PM001',
  name: 'Head Control',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 1,
  row: 1,
  requires: [],
  strengthens: ['PM005', 'PM007'],
  milestone: true,
  evidence: [
    'Lifts head briefly when placed on tummy',
    'Holds head upright and steady when supported at chest',
    'Turns head toward a sound or light source',
  ],
  typical_age_months: { start: 1, end: 4 },
}

const PM002: Skill = {
  id: 'PM002',
  name: 'Visual Tracking',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 1,
  row: 2,
  requires: [],
  strengthens: ['PM006'],
  milestone: false,
  evidence: [
    'Follows a slowly moving object 180° from side to side',
    'Maintains gaze on a face moving across their visual field',
    'Eyes lock onto a high-contrast object held 20–30 cm away',
  ],
  typical_age_months: { start: 1, end: 3 },
}

const PM003: Skill = {
  id: 'PM003',
  name: 'Hand Opening',
  domain: 'physical_motor',
  category: 'fine_motor',
  tier: 1,
  row: 3,
  requires: [],
  strengthens: ['PM006', 'PM008'],
  milestone: false,
  evidence: [
    'Hands rest open or loosely fisted most of the time',
    'Fingers spread apart when touched on the back of the hand',
    'Fist is no longer constantly clenched during alert periods',
  ],
  typical_age_months: { start: 1, end: 3 },
}

const PM004: Skill = {
  id: 'PM004',
  name: 'Hands to Mouth Contact',
  domain: 'physical_motor',
  category: 'fine_motor',
  tier: 1,
  row: 4,
  requires: [],
  strengthens: ['PM008'],
  milestone: false,
  evidence: [
    'Brings hands together at midline and mouths them',
    'Sucks on fingers or fist as self-soothing',
    'Bats at a hanging toy with an open hand',
  ],
  typical_age_months: { start: 2, end: 4 },
}

// --- Tier 2 ----------------------------------------------------------------

const PM005: Skill = {
  id: 'PM005',
  name: 'Rolling Over',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 2,
  row: 1,
  requires: ['PM001'],
  strengthens: ['PM009'],
  milestone: true,
  evidence: [
    'Rolls from tummy to back using arm push',
    'Rolls from back to side reaching across midline',
    'Completes a full back-to-tummy roll',
  ],
  typical_age_months: { start: 3, end: 6 },
}

const PM007: Skill = {
  id: 'PM007',
  name: 'Supported Sitting',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 2,
  row: 2,
  requires: ['PM001'],
  strengthens: ['PM009', 'PM010'],
  milestone: false,
  evidence: [
    'Sits in a high chair or with hands propped forward for 30+ seconds',
    'Holds head fully upright without head lag when pulled to sitting',
    'Bears weight through legs when held standing at a surface',
  ],
  typical_age_months: { start: 4, end: 6 },
}

const PM006: Skill = {
  id: 'PM006',
  name: 'Purposeful Reaching',
  domain: 'physical_motor',
  category: 'fine_motor',
  tier: 2,
  row: 3,
  requires: ['PM002', 'PM003'],
  strengthens: ['PM008'],
  milestone: false,
  evidence: [
    'Extends arm toward a nearby toy with clear intent',
    'Adjusts trajectory mid-reach when object is moved slightly',
    'Reaches with one hand rather than swiping with both',
  ],
  typical_age_months: { start: 3, end: 5 },
}

// --- Tier 3 ----------------------------------------------------------------

const PM011: Skill = {
  id: 'PM011',
  name: 'Belly Crawling',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 3,
  row: 1,
  requires: ['PM005', 'PM007'],
  strengthens: ['PM013'],
  milestone: false,
  evidence: [
    'Propels forward on tummy using arms and legs',
    'Commando-crawls to reach a toy placed just out of reach',
    'Pivots 360° on tummy to face a new direction',
  ],
  typical_age_months: { start: 6, end: 9 },
}

const PM009: Skill = {
  id: 'PM009',
  name: 'Independent Sitting',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 3,
  row: 2,
  requires: ['PM007'],
  strengthens: ['PM013'],
  milestone: true,
  evidence: [
    'Sits without support for at least 30 seconds',
    'Reaches for a toy from seated position without toppling',
    'Recovers balance after leaning to one side',
  ],
  typical_age_months: { start: 5, end: 8 },
}

const PM008: Skill = {
  id: 'PM008',
  name: 'Grasping Objects',
  domain: 'physical_motor',
  category: 'fine_motor',
  tier: 3,
  row: 4,
  requires: ['PM006', 'PM003'],
  strengthens: ['PM011', 'PM012'],
  milestone: false,
  evidence: [
    'Closes fingers around a rattle placed in palm with clear intent',
    'Holds a small toy for several seconds before dropping',
    'Grasps a dangling ring and pulls it toward them',
  ],
  typical_age_months: { start: 3, end: 6 },
}

// --- Tier 4 ----------------------------------------------------------------

const PM013: Skill = {
  id: 'PM013',
  name: 'Hands and Knees Crawling',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 4,
  row: 1,
  requires: ['PM011', 'PM009'],
  strengthens: ['PM017'],
  milestone: true,
  evidence: [
    'Moves forward on hands and knees in a coordinated reciprocal pattern',
    'Crawls around a small obstacle',
    'Crawls up a single step or low incline',
  ],
  typical_age_months: { start: 7, end: 10 },
}

const PM010: Skill = {
  id: 'PM010',
  name: 'Object Transfer Between Hands',
  domain: 'physical_motor',
  category: 'object_manipulation',
  tier: 4,
  row: 2,
  requires: ['PM008'],
  strengthens: ['PM012', 'PM015'],
  milestone: false,
  evidence: [
    'Passes a small toy from one hand to the other',
    'Holds two objects simultaneously, one in each hand',
    'Reaches for a second toy while holding a first',
  ],
  typical_age_months: { start: 5, end: 7 },
}

const PM012: Skill = {
  id: 'PM012',
  name: 'Controlled Release',
  domain: 'physical_motor',
  category: 'object_manipulation',
  tier: 4,
  row: 3,
  requires: ['PM008'],
  strengthens: ['PM015', 'PM019'],
  milestone: false,
  evidence: [
    'Drops a toy into a container on purpose',
    'Hands an object to a caregiver on request',
    'Places an object down gently rather than just dropping it',
  ],
  typical_age_months: { start: 6, end: 9 },
}

// --- Tier 5 ----------------------------------------------------------------

const PM015: Skill = {
  id: 'PM015',
  name: 'Pulling to Stand',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 5,
  row: 1,
  requires: ['PM013'],
  strengthens: ['PM017'],
  milestone: false,
  evidence: [
    'Pulls up to standing at furniture from seated or kneeling',
    'Lowers back to floor with some control rather than dropping',
    'Stands holding onto furniture with one hand for a few seconds',
  ],
  typical_age_months: { start: 8, end: 11 },
}

const PM014: Skill = {
  id: 'PM014',
  name: 'Pincer Grasp',
  domain: 'physical_motor',
  category: 'fine_motor',
  tier: 5,
  row: 2,
  requires: ['PM010', 'PM012'],
  strengthens: ['PM019', 'PM020'],
  milestone: true,
  evidence: [
    'Picks up a small piece of food using tip of thumb and index finger',
    'Picks up a Cheerio or pea-sized object without raking motion',
    'Points with isolated index finger',
  ],
  typical_age_months: { start: 7, end: 10 },
}

// --- Tier 6 ----------------------------------------------------------------

const PM017: Skill = {
  id: 'PM017',
  name: 'Cruising Along Furniture',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 6,
  row: 1,
  requires: ['PM015'],
  strengthens: ['PM021'],
  milestone: false,
  evidence: [
    'Side-steps along a sofa or table while holding on',
    'Transfers grip from one piece of furniture to another',
    'Cruises several meters without sitting down',
  ],
  typical_age_months: { start: 9, end: 12 },
}

const PM016: Skill = {
  id: 'PM016',
  name: 'Finger Feeding',
  domain: 'physical_motor',
  category: 'self_care',
  tier: 6,
  row: 2,
  requires: ['PM014'],
  strengthens: ['PM020'],
  milestone: false,
  evidence: [
    'Picks up soft finger foods and brings to mouth independently',
    'Releases food into mouth with control',
    'Feeds themselves a full portion of soft finger food',
  ],
  typical_age_months: { start: 8, end: 12 },
}

const PM018: Skill = {
  id: 'PM018',
  name: 'Block Stacking',
  domain: 'physical_motor',
  category: 'object_manipulation',
  tier: 6,
  row: 3,
  requires: ['PM014', 'PM012'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Stacks 2 blocks without them immediately toppling',
    'Stacks 3+ blocks in a tower',
    'Places a block carefully to balance it on another',
  ],
  typical_age_months: { start: 11, end: 18 },
}

// --- Tier 7 ----------------------------------------------------------------

const PM020: Skill = {
  id: 'PM020',
  name: 'Standing Independently',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 7,
  row: 1,
  requires: ['PM017'],
  strengthens: ['PM021'],
  milestone: true,
  evidence: [
    'Stands without holding on for 5+ seconds',
    'Bends to pick up an object from the floor and returns to standing',
    'Claps hands while standing unsupported',
  ],
  typical_age_months: { start: 10, end: 13 },
}

const PM019: Skill = {
  id: 'PM019',
  name: 'Spoon Use',
  domain: 'physical_motor',
  category: 'self_care',
  tier: 7,
  row: 2,
  requires: ['PM016'],
  strengthens: ['PM024'],
  milestone: false,
  evidence: [
    'Scoops food onto a spoon and brings it to mouth',
    'Keeps food on spoon most of the time',
    'Chooses spoon over hands for soft foods',
  ],
  typical_age_months: { start: 12, end: 18 },
}

// --- Tier 8 ----------------------------------------------------------------

const PM021: Skill = {
  id: 'PM021',
  name: 'Independent Walking',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 8,
  row: 1,
  requires: ['PM020'],
  strengthens: ['PM022', 'PM023'],
  milestone: true,
  evidence: [
    'Takes 5+ independent steps without holding on',
    'Stops and changes direction while walking',
    'Recovers from a stumble without falling most of the time',
  ],
  typical_age_months: { start: 9, end: 15 },
}

const PM024: Skill = {
  id: 'PM024',
  name: 'Self-Feeding with Utensils',
  domain: 'physical_motor',
  category: 'self_care',
  tier: 8,
  row: 2,
  requires: ['PM019'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Uses a spoon to eat a full meal with few spills',
    'Drinks from an open cup with one hand without major spilling',
    'Spears food with a fork independently',
  ],
  typical_age_months: { start: 18, end: 24 },
}

// --- Tier 9 ----------------------------------------------------------------

const PM022: Skill = {
  id: 'PM022',
  name: 'Running',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 9,
  row: 1,
  requires: ['PM021'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Moves at a fast walk with brief airborne phase',
    'Chases a ball or another person',
    'Slows and stops with reasonable control',
  ],
  typical_age_months: { start: 14, end: 20 },
}

const PM023: Skill = {
  id: 'PM023',
  name: 'Climbing',
  domain: 'physical_motor',
  category: 'gross_motor',
  tier: 9,
  row: 2,
  requires: ['PM021'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Climbs onto a low sofa or chair',
    'Climbs up a small slide or play structure',
    'Descends stairs on hands and knees facing backward',
  ],
  typical_age_months: { start: 13, end: 20 },
}

// ===========================================================================
// COGNITIVE  (CO001 – CO020)
// 6 tiers
// ===========================================================================

// --- Tier 1 ----------------------------------------------------------------

const CO001: Skill = {
  id: 'CO001',
  name: 'Attention to Faces',
  domain: 'cognitive',
  category: 'attention',
  tier: 1,
  row: 1,
  requires: [],
  strengthens: ['CO006', 'SE002'],
  milestone: false,
  evidence: [
    'Gazes at a face held 20–30 cm away for several seconds',
    'Prefers looking at faces over objects of similar size',
    'Eyes widen in response to an expressive face',
  ],
  typical_age_months: { start: 0, end: 2 },
}

const CO002: Skill = {
  id: 'CO002',
  name: 'Attention to Objects',
  domain: 'cognitive',
  category: 'attention',
  tier: 1,
  row: 2,
  requires: [],
  strengthens: ['CO005'],
  milestone: false,
  evidence: [
    'Stares at a high-contrast pattern or mobile for 10+ seconds',
    'Eyes track a slowly moving object briefly',
    'Stops moving when a new object appears in view',
  ],
  typical_age_months: { start: 0, end: 2 },
}

const CO003: Skill = {
  id: 'CO003',
  name: 'Sensory Exploration',
  domain: 'cognitive',
  category: 'causal_reasoning',
  tier: 1,
  row: 3,
  requires: [],
  strengthens: ['CO005', 'CO007'],
  milestone: false,
  evidence: [
    'Mouths, shakes, or bangs objects to explore their properties',
    'Reacts to new textures (smooth, rough) with interest or withdrawal',
    'Repeats an action (kicking a crib toy) to recreate a sound or movement',
  ],
  typical_age_months: { start: 1, end: 4 },
}

const CO004: Skill = {
  id: 'CO004',
  name: 'Recognition of Familiar People',
  domain: 'cognitive',
  category: 'memory',
  tier: 1,
  row: 4,
  requires: [],
  strengthens: ['CO006'],
  milestone: false,
  evidence: [
    'Reacts differently to a primary caregiver than to a stranger',
    'Calms more quickly when held by a familiar person',
    'Brightens (kicks, smiles, vocalizes) when a familiar person appears',
  ],
  typical_age_months: { start: 1, end: 4 },
}

// --- Tier 2 ----------------------------------------------------------------

const CO008: Skill = {
  id: 'CO008',
  name: 'Learning By Observation',
  domain: 'cognitive',
  category: 'imitation',
  tier: 2,
  row: 1,
  requires: ['CO001'],
  strengthens: ['CO010'],
  milestone: false,
  evidence: [
    'Watches a caregiver demonstrate an action with full attention',
    'Looks toward where a caregiver is looking',
    'Modifies own behavior after watching another person act',
  ],
  typical_age_months: { start: 3, end: 7 },
}

const CO007: Skill = {
  id: 'CO007',
  name: 'Sustained Attention',
  domain: 'cognitive',
  category: 'attention',
  tier: 2,
  row: 2,
  requires: ['CO002'],
  strengthens: ['CO009'],
  milestone: false,
  evidence: [
    'Examines a single toy for 1+ minute without distraction',
    'Watches a caregiver action through to completion',
    'Returns attention to the same object after a brief interruption',
  ],
  typical_age_months: { start: 3, end: 6 },
}

const CO005: Skill = {
  id: 'CO005',
  name: 'Cause-Effect Learning',
  domain: 'cognitive',
  category: 'causal_reasoning',
  tier: 2,
  row: 3,
  requires: ['CO003'],
  strengthens: ['CO009', 'CO011'],
  milestone: false,
  evidence: [
    'Kicks or bats a crib mobile repeatedly to make it move',
    'Shakes a rattle expecting the sound',
    'Drops objects repeatedly as if testing what will happen',
  ],
  typical_age_months: { start: 3, end: 6 },
}

const CO006: Skill = {
  id: 'CO006',
  name: 'Anticipation of Routines',
  domain: 'cognitive',
  category: 'memory',
  tier: 2,
  row: 4,
  requires: ['CO004'],
  strengthens: ['CO012'],
  milestone: false,
  evidence: [
    'Opens mouth or fusses when bib is put on before feeding',
    'Kicks excitedly when bath supplies appear',
    'Reaches toward caregiver when pick-up routine begins',
  ],
  typical_age_months: { start: 3, end: 6 },
}

// --- Tier 3 ----------------------------------------------------------------

const CO010: Skill = {
  id: 'CO010',
  name: 'Action Imitation',
  domain: 'cognitive',
  category: 'imitation',
  tier: 3,
  row: 1,
  requires: ['CO008'],
  strengthens: ['CO016'],
  milestone: false,
  evidence: [
    'Copies a new action (clapping, waving) immediately after seeing it',
    'Imitates a familiar action with a new object',
    'Attempts to repeat a caregiver gesture even if imperfectly',
  ],
  typical_age_months: { start: 6, end: 9 },
}

const CO009: Skill = {
  id: 'CO009',
  name: 'Object Permanence',
  domain: 'cognitive',
  category: 'memory',
  tier: 3,
  row: 2,
  requires: ['CO007', 'CO005'],
  strengthens: ['CO014', 'CO013'],
  milestone: true,
  evidence: [
    'Looks for a toy that has been hidden under a cloth',
    'Reaches behind a screen for a toy they watched being placed there',
    'Protests when a toy is removed and hidden instead of being distracted',
  ],
  typical_age_months: { start: 6, end: 10 },
}

const CO011: Skill = {
  id: 'CO011',
  name: 'Goal-Directed Actions',
  domain: 'cognitive',
  category: 'problem_solving',
  tier: 3,
  row: 3,
  requires: ['CO005'],
  strengthens: ['CO013', 'CO014'],
  milestone: false,
  evidence: [
    'Pulls a cloth to retrieve a toy resting on top of it',
    'Pushes aside an obstacle to reach a goal object',
    'Persists at a task for multiple attempts before giving up',
  ],
  typical_age_months: { start: 6, end: 9 },
}

// --- Tier 4 ----------------------------------------------------------------

const CO016: Skill = {
  id: 'CO016',
  name: 'Deferred Imitation',
  domain: 'cognitive',
  category: 'imitation',
  tier: 4,
  row: 1,
  requires: ['CO010'],
  strengthens: ['CO018'],
  milestone: false,
  evidence: [
    'Reproduces an action hours or a day after seeing it',
    'Imitates something they saw on a previous day without prompting',
    'Copies a new word or gesture they heard earlier in the day',
  ],
  typical_age_months: { start: 9, end: 15 },
}

const CO012: Skill = {
  id: 'CO012',
  name: 'Search Behavior',
  domain: 'cognitive',
  category: 'memory',
  tier: 4,
  row: 2,
  requires: ['CO009'],
  strengthens: ['CO014'],
  milestone: false,
  evidence: [
    'Searches in a second hiding place if the first is empty',
    'Looks for an object in the location where it was last seen',
    'Lifts multiple covers to find a hidden toy',
  ],
  typical_age_months: { start: 7, end: 10 },
}

const CO017: Skill = {
  id: 'CO017',
  name: 'Simple Categorization',
  domain: 'cognitive',
  category: 'symbolic',
  tier: 4,
  row: 3,
  requires: ['CO009'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Groups similar objects together (all balls in one pile)',
    'Sorts objects into two categories (big/small, animals/vehicles)',
    'Applies a label like "doggy" to all four-legged animals',
  ],
  typical_age_months: { start: 12, end: 18 },
}

const CO015: Skill = {
  id: 'CO015',
  name: 'Sequence Understanding',
  domain: 'cognitive',
  category: 'memory',
  tier: 4,
  row: 4,
  requires: ['CO006'],
  strengthens: ['CO017'],
  milestone: false,
  evidence: [
    'Anticipates the next step in a familiar multi-step routine',
    'Completes a familiar 2-step action sequence independently',
    'Protests when a familiar sequence is done out of order',
  ],
  typical_age_months: { start: 9, end: 13 },
}

const CO013: Skill = {
  id: 'CO013',
  name: 'Trial-and-Error Problem Solving',
  domain: 'cognitive',
  category: 'problem_solving',
  tier: 4,
  row: 5,
  requires: ['CO011'],
  strengthens: ['CO015'],
  milestone: false,
  evidence: [
    'Tries several strategies to get a toy out of a container',
    'Adjusts approach after a failed attempt without adult help',
    'Discovers a shape sorter solution through repeated attempts',
  ],
  typical_age_months: { start: 9, end: 13 },
}

// --- Tier 5 ----------------------------------------------------------------

const CO019: Skill = {
  id: 'CO019',
  name: 'Symbolic Representation',
  domain: 'cognitive',
  category: 'symbolic',
  tier: 5,
  row: 1,
  requires: ['CO016'],
  strengthens: ['CO020'],
  milestone: true,
  evidence: [
    'Uses one object to stand for another (banana as phone)',
    'Understands that a picture represents a real object',
    'Draws a scribble and labels it as something ("doggy")',
  ],
  typical_age_months: { start: 14, end: 20 },
}

const CO014: Skill = {
  id: 'CO014',
  name: 'Means-End Understanding',
  domain: 'cognitive',
  category: 'causal_reasoning',
  tier: 5,
  row: 2,
  requires: ['CO012'],
  strengthens: ['CO015'],
  milestone: false,
  evidence: [
    'Pulls a string to bring a toy within reach',
    'Uses a stick or tool to knock an object closer',
    'Stacks objects to reach something placed up high',
  ],
  typical_age_months: { start: 9, end: 12 },
}

// --- Tier 6 ----------------------------------------------------------------

const CO020: Skill = {
  id: 'CO020',
  name: 'Pretend Play',
  domain: 'cognitive',
  category: 'symbolic',
  tier: 6,
  row: 1,
  requires: ['CO019'],
  strengthens: [],
  milestone: true,
  evidence: [
    'Pretends to drink from an empty cup or feed a toy',
    'Assigns roles to toys in a simple scenario',
    'Extends a pretend sequence across two or more actions',
  ],
  typical_age_months: { start: 16, end: 24 },
}

const CO018: Skill = {
  id: 'CO018',
  name: 'Tool Use for Goals',
  domain: 'cognitive',
  category: 'problem_solving',
  tier: 6,
  row: 2,
  requires: ['CO014'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Uses a spoon or stick to reach an object they cannot grasp directly',
    'Climbs on a stool to reach something on a high surface',
    'Selects the correct tool for a task from two options',
  ],
  typical_age_months: { start: 12, end: 18 },
}

// ===========================================================================
// LANGUAGE & COMMUNICATION  (LC001 – LC020)
// 6 tiers
// ===========================================================================

// --- Tier 1 ----------------------------------------------------------------

const LC001: Skill = {
  id: 'LC001',
  name: 'Attention to Human Voices',
  domain: 'language_communication',
  category: 'receptive_language',
  tier: 1,
  row: 1,
  requires: [],
  strengthens: ['LC005', 'LC008'],
  milestone: false,
  evidence: [
    'Turns head toward a speaking voice',
    'Stills or calms when a familiar voice is heard',
    'Shows more sustained attention to speech than to non-speech sounds',
  ],
  typical_age_months: { start: 0, end: 2 },
}

const LC002: Skill = {
  id: 'LC002',
  name: 'Smiling',
  domain: 'language_communication',
  category: 'pragmatics',
  tier: 1,
  row: 2,
  requires: [],
  strengthens: ['LC006'],
  milestone: true,
  evidence: [
    'Smiles in response to a smiling face rather than spontaneously',
    'Maintains a smile during back-and-forth facial exchange',
    'Smiles specifically at familiar caregivers more than strangers',
  ],
  typical_age_months: { start: 1, end: 3 },
}

const LC003: Skill = {
  id: 'LC003',
  name: 'Cry Differentiation',
  domain: 'language_communication',
  category: 'expressive_language',
  tier: 1,
  row: 3,
  requires: [],
  strengthens: ['LC009'],
  milestone: false,
  evidence: [
    'Has distinct cries for hunger, pain, and tiredness',
    'Caregiver can reliably distinguish at least two cry types',
    'Stops crying quickly when the correct need is met',
  ],
  typical_age_months: { start: 0, end: 3 },
}

const LC004: Skill = {
  id: 'LC004',
  name: 'Turn-Taking Awareness',
  domain: 'language_communication',
  category: 'pragmatics',
  tier: 1,
  row: 4,
  requires: [],
  strengthens: ['LC006'],
  milestone: false,
  evidence: [
    'Pauses vocalization to allow caregiver to respond',
    'Resumes cooing when caregiver pauses',
    'Shows visible anticipation (wide eyes, open mouth) before caregiver\'s turn',
  ],
  typical_age_months: { start: 1, end: 4 },
}

// --- Tier 2 ----------------------------------------------------------------

const LC008: Skill = {
  id: 'LC008',
  name: 'Sound Discrimination',
  domain: 'language_communication',
  category: 'receptive_language',
  tier: 2,
  row: 1,
  requires: ['LC001'],
  strengthens: ['LC010'],
  milestone: false,
  evidence: [
    'Reacts differently to their own name versus other names',
    'Startles to a sudden loud sound but not a repeated quiet one',
    'Turns more reliably toward the language they hear most at home',
  ],
  typical_age_months: { start: 3, end: 6 },
}

const LC005: Skill = {
  id: 'LC005',
  name: 'Cooing',
  domain: 'language_communication',
  category: 'vocalization',
  tier: 2,
  row: 2,
  requires: ['LC001'],
  strengthens: ['LC009'],
  milestone: false,
  evidence: [
    'Produces sustained vowel-like sounds (oooh, aaah)',
    'Coos in response to a caregiver speaking to them',
    'Experiments with pitch and duration of cooing sounds',
  ],
  typical_age_months: { start: 2, end: 4 },
}

const LC007: Skill = {
  id: 'LC007',
  name: 'Joint Attention',
  domain: 'language_communication',
  category: 'pragmatics',
  tier: 2,
  row: 3,
  // Note: requires SE003 (Social Smiling) — cross-domain dependency
  requires: ['LC002'],
  strengthens: ['LC011', 'LC012'],
  milestone: true,
  evidence: [
    'Follows a caregiver\'s pointing gesture to look at an object',
    'Looks at what a caregiver is looking at',
    'Alternates gaze between an interesting object and a caregiver\'s face',
  ],
  typical_age_months: { start: 4, end: 8 },
}

const LC006: Skill = {
  id: 'LC006',
  name: 'Vocal Play',
  domain: 'language_communication',
  category: 'vocalization',
  tier: 2,
  row: 4,
  requires: ['LC004'],
  strengthens: ['LC009'],
  milestone: false,
  evidence: [
    'Produces raspberries, squeals, and growls for fun',
    'Experiments with loud vs soft and high vs low sounds',
    'Vocalizes during solo play without a social prompt',
  ],
  typical_age_months: { start: 3, end: 6 },
}

// --- Tier 3 ----------------------------------------------------------------

const LC010: Skill = {
  id: 'LC010',
  name: 'Response to Name',
  domain: 'language_communication',
  category: 'receptive_language',
  tier: 3,
  row: 1,
  requires: ['LC008'],
  strengthens: ['LC011'],
  milestone: false,
  evidence: [
    'Reliably turns head toward their own name from across the room',
    'Responds to name even when engaged with a toy',
    'Does not respond equally to other names or random words',
  ],
  typical_age_months: { start: 5, end: 8 },
}

const LC011: Skill = {
  id: 'LC011',
  name: 'Understanding Familiar Words',
  domain: 'language_communication',
  category: 'receptive_language',
  tier: 3,
  row: 2,
  requires: ['LC007'],
  strengthens: ['LC014'],
  milestone: false,
  evidence: [
    'Looks toward "mama" or "dada" when the word is said',
    'Reaches toward a named object ("where\'s the ball?")',
    'Slows or stops activity when "no" is said firmly',
  ],
  typical_age_months: { start: 6, end: 10 },
}

const LC012: Skill = {
  id: 'LC012',
  name: 'Communicative Gestures',
  domain: 'language_communication',
  category: 'pragmatics',
  tier: 3,
  row: 3,
  requires: ['LC007'],
  strengthens: ['LC013', 'LC015'],
  milestone: false,
  evidence: [
    'Reaches up with arms to signal "pick me up"',
    'Waves bye-bye on cue or spontaneously',
    'Shakes head for "no" or nods for "yes"',
  ],
  typical_age_months: { start: 6, end: 10 },
}

const LC009: Skill = {
  id: 'LC009',
  name: 'Canonical Babbling',
  domain: 'language_communication',
  category: 'vocalization',
  tier: 3,
  row: 4,
  requires: ['LC005', 'LC006'],
  strengthens: ['LC013'],
  milestone: true,
  evidence: [
    'Produces reduplicated syllable strings: "bababa", "mamama", "dadada"',
    'Babbles with varied intonation resembling conversational speech',
    'Uses babble during social exchanges as if conversing',
  ],
  typical_age_months: { start: 5, end: 8 },
}

// --- Tier 4 ----------------------------------------------------------------

const LC015: Skill = {
  id: 'LC015',
  name: 'Follow Simple Instructions',
  domain: 'language_communication',
  category: 'receptive_language',
  tier: 4,
  row: 1,
  requires: ['LC011'],
  strengthens: ['LC018'],
  milestone: false,
  evidence: [
    'Follows a one-step instruction without gesture cue ("get your shoes")',
    'Retrieves a named object from another room',
    'Follows two different one-step instructions in sequence',
  ],
  typical_age_months: { start: 9, end: 14 },
}

const LC013: Skill = {
  id: 'LC013',
  name: 'Attention Pointing',
  domain: 'language_communication',
  category: 'pragmatics',
  tier: 4,
  row: 2,
  requires: ['LC012'],
  strengthens: ['LC016'],
  milestone: true,
  evidence: [
    'Points to an interesting object or event to show a caregiver',
    'Checks caregiver face after pointing to confirm shared attention',
    'Points to a desired object rather than just reaching',
  ],
  typical_age_months: { start: 8, end: 12 },
}

const LC014: Skill = {
  id: 'LC014',
  name: 'Meaningful First Words',
  domain: 'language_communication',
  category: 'expressive_language',
  tier: 4,
  row: 3,
  requires: ['LC009', 'LC011'],
  strengthens: ['LC016', 'LC017'],
  milestone: true,
  evidence: [
    'Uses a consistent sound or word to refer to the same object or person',
    'Uses a word spontaneously (not just as imitation)',
    'Has 1–3 reliable words used in appropriate context',
  ],
  typical_age_months: { start: 9, end: 14 },
}

// --- Tier 5 ----------------------------------------------------------------

const LC016: Skill = {
  id: 'LC016',
  name: 'Intentional Communication',
  domain: 'language_communication',
  category: 'pragmatics',
  tier: 5,
  row: 1,
  requires: ['LC012', 'LC014'],
  strengthens: ['LC018'],
  milestone: false,
  evidence: [
    'Uses gesture + vocalization together to make a request',
    'Persists in communicating when not immediately understood',
    'Checks caregiver\'s face to confirm message was received',
  ],
  typical_age_months: { start: 9, end: 14 },
}

const LC017: Skill = {
  id: 'LC017',
  name: 'Vocabulary Expansion',
  domain: 'language_communication',
  category: 'expressive_language',
  tier: 5,
  row: 2,
  requires: ['LC014'],
  strengthens: ['LC018'],
  milestone: false,
  evidence: [
    'Has 10+ recognizable words used spontaneously',
    'Adds 1–2 new words per week',
    'Attempts to name objects when asked "what\'s that?"',
  ],
  typical_age_months: { start: 12, end: 18 },
}

const LC019: Skill = {
  id: 'LC019',
  name: 'Two-Step Directions',
  domain: 'language_communication',
  category: 'receptive_language',
  tier: 5,
  row: 3,
  requires: ['LC015'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Follows "get your shoes and bring them to me" without a gesture',
    'Completes two related actions in the correct order',
    'Understands two-step directions in a novel context',
  ],
  typical_age_months: { start: 18, end: 24 },
}

// --- Tier 6 ----------------------------------------------------------------

const LC020: Skill = {
  id: 'LC020',
  name: 'Conversational Exchange',
  domain: 'language_communication',
  category: 'pragmatics',
  tier: 6,
  row: 1,
  requires: ['LC016'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Takes 3+ consecutive turns in a verbal exchange',
    'Stays on topic for 2–3 turns before shifting',
    'Uses words or sounds to initiate a new topic',
  ],
  typical_age_months: { start: 18, end: 24 },
}

const LC018: Skill = {
  id: 'LC018',
  name: 'Two-Word Combinations',
  domain: 'language_communication',
  category: 'expressive_language',
  tier: 6,
  row: 2,
  requires: ['LC017'],
  strengthens: [],
  milestone: true,
  evidence: [
    'Spontaneously combines two words ("more milk", "daddy go")',
    'Uses combinations to comment, request, or describe',
    'Produces 3+ different two-word phrases regularly',
  ],
  typical_age_months: { start: 18, end: 24 },
}

// ===========================================================================
// SOCIAL & EMOTIONAL  (SE001 – SE020)
// 7 tiers
// ===========================================================================

// --- Tier 1 ----------------------------------------------------------------

const SE001: Skill = {
  id: 'SE001',
  name: 'Eye Contact',
  domain: 'social_emotional',
  category: 'social_bonding',
  tier: 1,
  row: 1,
  requires: [],
  strengthens: ['SE006'],
  milestone: false,
  evidence: [
    'Holds mutual gaze with a caregiver for 3+ seconds',
    'Re-establishes eye contact after briefly looking away',
    'Eyes widen and face brightens in response to eye contact',
  ],
  typical_age_months: { start: 0, end: 2 },
}

const SE002: Skill = {
  id: 'SE002',
  name: 'Comfort from Caregiver',
  domain: 'social_emotional',
  category: 'emotional_regulation',
  tier: 1,
  row: 2,
  requires: [],
  strengthens: ['SE005', 'SE007'],
  milestone: false,
  evidence: [
    'Crying reduces significantly when picked up by primary caregiver',
    'Stops fussing when caregiver\'s voice is heard',
    'Body relaxes visibly when held against caregiver\'s chest',
  ],
  typical_age_months: { start: 0, end: 3 },
}

// SE003 is Social Smiling — shared node referenced by LC007 (Joint Attention)
const SE003: Skill = {
  id: 'SE003',
  name: 'Social Smiling',
  domain: 'social_emotional',
  category: 'social_bonding',
  tier: 1,
  row: 3,
  requires: [],
  strengthens: ['SE006', 'LC007'],
  milestone: true,
  evidence: [
    'Smiles in direct response to a smiling face, not just randomly',
    'Sustains smile during a face-to-face exchange',
    'Smiles more readily at familiar people than strangers',
  ],
  typical_age_months: { start: 1, end: 3 },
}

const SE004: Skill = {
  id: 'SE004',
  name: 'Emotional Expression',
  domain: 'social_emotional',
  category: 'emotional_expression',
  tier: 1,
  row: 4,
  requires: [],
  strengthens: ['SE008'],
  milestone: false,
  evidence: [
    'Shows visible pleasure (kicking, vocalizing) in response to stimulation',
    'Shows visible distress (crying, furrowed brow) to discomfort',
    'Expresses at least two distinct emotional states recognizably',
  ],
  typical_age_months: { start: 0, end: 3 },
}

// --- Tier 2 ----------------------------------------------------------------

const SE006: Skill = {
  id: 'SE006',
  name: 'Reciprocal Interaction',
  domain: 'social_emotional',
  category: 'social_interaction',
  tier: 2,
  row: 1,
  requires: ['SE001', 'SE003'],
  strengthens: ['SE011', 'SE014'],
  milestone: false,
  evidence: [
    'Responds to a caregiver\'s facial expression with a matching one',
    'Engages in a 3+ turn back-and-forth vocal or facial exchange',
    'Initiates a social game like peek-a-boo by covering their face',
  ],
  typical_age_months: { start: 2, end: 5 },
}

const SE005: Skill = {
  id: 'SE005',
  name: 'Preference for Caregivers',
  domain: 'social_emotional',
  category: 'social_bonding',
  tier: 2,
  row: 2,
  requires: ['SE002'],
  strengthens: ['SE007'],
  milestone: false,
  evidence: [
    'Reaches specifically toward a familiar caregiver when upset',
    'Calms faster with a familiar person than with a stranger',
    'Shows selective brightening only for known people',
  ],
  typical_age_months: { start: 2, end: 6 },
}

const SE008: Skill = {
  id: 'SE008',
  name: 'Emotional Expression',
  domain: 'social_emotional',
  category: 'emotional_expression',
  tier: 2,
  row: 3,
  requires: ['SE004'],
  strengthens: ['SE013'],
  milestone: false,
  evidence: [
    'Expresses curiosity, surprise, and frustration distinctly',
    'Reacts to a novel object with a clear mix of interest and wariness',
    'Emotion is recognizable to people outside the immediate family',
  ],
  typical_age_months: { start: 3, end: 6 },
}

// --- Tier 3 ----------------------------------------------------------------

const SE011: Skill = {
  id: 'SE011',
  name: 'Social Referencing',
  domain: 'social_emotional',
  category: 'social_interaction',
  tier: 3,
  row: 2,
  requires: ['SE006'],
  strengthens: ['SE013'],
  milestone: false,
  evidence: [
    'Looks to caregiver\'s face before touching an unfamiliar object',
    'Adjusts approach to a new situation based on caregiver\'s expression',
    'Moves toward or away from a novel stimulus based on caregiver reaction',
  ],
  typical_age_months: { start: 7, end: 10 },
}

const SE007: Skill = {
  id: 'SE007',
  name: 'Attachment Formation',
  domain: 'social_emotional',
  category: 'social_bonding',
  tier: 3,
  row: 3,
  requires: ['SE005'],
  strengthens: ['SE009', 'SE010', 'SE012'],
  milestone: true,
  evidence: [
    'Shows clear preference for primary caregiver over all others',
    'Uses caregiver as a safe base to explore from and return to',
    'Protests when primary caregiver leaves the room',
  ],
  typical_age_months: { start: 4, end: 8 },
}

const SE014: Skill = {
  id: 'SE014',
  name: 'Social Imitation',
  domain: 'social_emotional',
  category: 'social_interaction',
  tier: 3,
  row: 4,
  requires: ['SE006'],
  strengthens: ['SE015', 'SE019'],
  milestone: false,
  evidence: [
    'Copies simple actions like clapping or banging a drum after watching',
    'Imitates a playful behavior to re-engage an adult',
    'Mirrors another person\'s facial expression deliberately',
  ],
  typical_age_months: { start: 8, end: 12 },
}

// --- Tier 4 ----------------------------------------------------------------

const SE009: Skill = {
  id: 'SE009',
  name: 'Stranger Wariness',
  domain: 'social_emotional',
  category: 'social_bonding',
  tier: 4,
  row: 1,
  requires: ['SE007'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Fusses or clings when approached by an unfamiliar adult',
    'Studies a stranger\'s face intently before deciding how to react',
    'Relaxes when a stranger is welcomed by the primary caregiver',
  ],
  typical_age_months: { start: 6, end: 10 },
}

const SE010: Skill = {
  id: 'SE010',
  name: 'Separation Awareness',
  domain: 'social_emotional',
  category: 'emotional_regulation',
  tier: 4,
  row: 3,
  requires: ['SE007'],
  strengthens: ['SE016'],
  milestone: false,
  evidence: [
    'Cries or protests when primary caregiver leaves the room',
    'Searches the door or space where caregiver exited',
    'Greets returning caregiver with clear positive affect',
  ],
  typical_age_months: { start: 6, end: 10 },
}

const SE012: Skill = {
  id: 'SE012',
  name: 'Seeking Caregiver Support',
  domain: 'social_emotional',
  category: 'emotional_regulation',
  tier: 4,
  row: 5,
  requires: ['SE007'],
  strengthens: ['SE013'],
  milestone: false,
  evidence: [
    'Crawls or walks to caregiver when frightened or hurt',
    'Reaches arms up to be held when distressed',
    'Calms within 1–2 minutes of caregiver contact after a fall or fright',
  ],
  typical_age_months: { start: 6, end: 10 },
}

const SE015: Skill = {
  id: 'SE015',
  name: 'Shared Enjoyment',
  domain: 'social_emotional',
  category: 'social_interaction',
  tier: 4,
  row: 6,
  requires: ['SE014'],
  strengthens: ['SE017'],
  milestone: false,
  evidence: [
    'Laughs with a caregiver during play rather than just in response to tickling',
    'Makes eye contact to share delight in a funny event',
    'Initiates a game to recreate a shared funny moment',
  ],
  typical_age_months: { start: 8, end: 12 },
}

// --- Tier 5 ----------------------------------------------------------------

const SE013: Skill = {
  id: 'SE013',
  name: 'Emotional Co-Regulation',
  domain: 'social_emotional',
  category: 'emotional_regulation',
  tier: 5,
  row: 2,
  requires: ['SE012', 'SE011'],
  strengthens: ['SE015'],
  milestone: false,
  evidence: [
    'Uses a caregiver\'s calming presence to recover from distress',
    'Accepts comfort strategies (rocking, words) to calm down',
    'Recovery from upset is faster when caregiver is present vs absent',
  ],
  typical_age_months: { start: 9, end: 14 },
}

const SE016: Skill = {
  id: 'SE016',
  name: 'Emerging Self-Awareness',
  domain: 'social_emotional',
  category: 'self_awareness',
  tier: 5,
  row: 3,
  requires: ['SE010'],
  strengthens: ['SE018'],
  milestone: false,
  evidence: [
    'Recognizes their own reflection in a mirror (reaching, smiling at it)',
    'Touches their own nose after seeing a mark on their face in a mirror',
    'Uses "me" or own name to refer to themselves',
  ],
  typical_age_months: { start: 12, end: 20 },
}

const SE020: Skill = {
  id: 'SE020',
  name: 'Simple Peer Interaction',
  domain: 'social_emotional',
  category: 'social_interaction',
  tier: 5,
  row: 4,
  requires: ['SE014', 'SE015'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Offers a toy to another child (even if briefly)',
    'Copies what another child is doing during parallel play',
    'Laughs in response to another child\'s laughter',
  ],
  typical_age_months: { start: 16, end: 24 },
}

// --- Tier 6 ----------------------------------------------------------------

const SE017: Skill = {
  id: 'SE017',
  name: 'Early Empathy',
  domain: 'social_emotional',
  category: 'emotional_expression',
  tier: 6,
  row: 1,
  requires: ['SE015', 'SE013'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Brings a toy or their own comfort object to a crying person',
    'Shows concern (worried face, touching) when someone is hurt',
    'Stops play to observe and respond to another\'s distress',
  ],
  typical_age_months: { start: 14, end: 24 },
}

const SE018: Skill = {
  id: 'SE018',
  name: 'Preference Expression',
  domain: 'social_emotional',
  category: 'self_awareness',
  tier: 6,
  row: 3,
  requires: ['SE016'],
  strengthens: ['SE019'],
  milestone: false,
  evidence: [
    'Points to or reaches for a preferred item when given a choice',
    'Shakes head "no" to an unwanted food or activity',
    'Clearly communicates a preference between two offered options',
  ],
  typical_age_months: { start: 12, end: 18 },
}

// --- Tier 7 ----------------------------------------------------------------

const SE019: Skill = {
  id: 'SE019',
  name: 'Autonomy Seeking',
  domain: 'social_emotional',
  category: 'self_awareness',
  tier: 7,
  row: 1,
  requires: ['SE018'],
  strengthens: [],
  milestone: false,
  evidence: [
    'Insists on doing a task themselves and resists caregiver help',
    'Says "me do it" or similar assertion',
    'Persists at a self-chosen task despite difficulty',
  ],
  typical_age_months: { start: 18, end: 24 },
}

// ===========================================================================
// Exports
// ===========================================================================

export const physicalMotorSkills: Skill[] = [
  PM001, PM002, PM003, PM004,
  PM005, PM006, PM007, PM008,
  PM009, PM010, PM011, PM012,
  PM013, PM014, PM015, PM016,
  PM017, PM018, PM019, PM020,
  PM021, PM022, PM023, PM024,
]

export const cognitiveSkills: Skill[] = [
  CO001, CO002, CO003, CO004,
  CO005, CO006, CO007, CO008,
  CO009, CO010, CO011, CO012,
  CO013, CO014, CO015, CO016,
  CO017, CO018, CO019, CO020,
]

export const languageSkills: Skill[] = [
  LC001, LC002, LC003, LC004,
  LC005, LC006, LC007, LC008,
  LC009, LC010, LC011, LC012,
  LC013, LC014, LC015, LC016,
  LC017, LC018, LC019, LC020,
]

export const socialEmotionalSkills: Skill[] = [
  SE001, SE002, SE003, SE004,
  SE005, SE006, SE007, SE008,
  SE009, SE010, SE011, SE012,
  SE013, SE014, SE015, SE016,
  SE017, SE018, SE019, SE020,
]

/** Full skill list — extend here as new domains are added */
export const skills: Skill[] = [
  ...physicalMotorSkills,
  ...cognitiveSkills,
  ...languageSkills,
  ...socialEmotionalSkills,
]

/** O(1) lookup by skill ID */
export const skillById = new Map<string, Skill>(
  skills.map((s) => [s.id, s])
)
