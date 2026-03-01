from enum import Enum

class DragonEvolutionEnum(Enum):
    EGG = 'egg'
    BABY = 'baby'
    TEEN = 'teen'
    ADULT = 'adult'

    @staticmethod
    def get_next_evolution(evolution_type):
        match evolution_type:
            case DragonEvolutionEnum.EGG:
                return DragonEvolutionEnum.BABY, 8
            case DragonEvolutionEnum.BABY:
                return DragonEvolutionEnum.TEEN, 12
            case DragonEvolutionEnum.TEEN:
                return DragonEvolutionEnum.ADULT, None
            case DragonEvolutionEnum.ADULT:
                return DragonEvolutionEnum.ADULT, None

