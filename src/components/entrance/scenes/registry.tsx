import type { ComponentType } from 'react'
import type { SceneKey, SceneProps } from './types'
import { EnvelopeScene, GateScene, DoorsScene, CurtainScene, LatticeScene, BookScene } from './weddingScenes'
import { LineSplitScene } from './moreScenes'
import { SkyScene, BloomScene, DawnScene, MeadowScene, BalloonsScene, GiftScene, SpotlightScene, ShutterScene, MountainScene, CandleScene, LeavesScene } from './occasionScenes'

export const SCENES: Record<SceneKey, ComponentType<SceneProps>> = {
  envelope: EnvelopeScene,
  gate: GateScene,
  doors: DoorsScene,
  curtain: CurtainScene,
  lattice: LatticeScene,
  book: BookScene,
  linesplit: LineSplitScene,
  sky: SkyScene,
  bloom: BloomScene,
  dawn: DawnScene,
  meadow: MeadowScene,
  balloons: BalloonsScene,
  gift: GiftScene,
  spotlight: SpotlightScene,
  shutter: ShutterScene,
  mountain: MountainScene,
  candle: CandleScene,
  leaves: LeavesScene,
}
