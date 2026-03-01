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
                return DragonEvolutionEnum.BABY
            case DragonEvolutionEnum.BABY:
                return DragonEvolutionEnum.TEEN
            case DragonEvolutionEnum.TEEN:
                return DragonEvolutionEnum.ADULT
            case DragonEvolutionEnum.ADULT:
                return DragonEvolutionEnum.ADULT

