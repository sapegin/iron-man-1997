CLS : SCREEN 13: COLOR 4
B$ = "                                                                      "
a$ = B$ +  _
"����� �ணࠬ�� : ���� ������� � ��⥬ ������� . ��� �ணࠬ��� ࠡ�⠫� : ��⥬ ������� � ���� ������� . ����讥 ᯠᨡ� ������ ����ﭥ ���ࣨ���� . �� ᯠᨡ� : SEPULTURA , OBITUARY , PANTERA , METALLICA , � ⠪ �� Ozzy Osbourne , Yngvie Malmsteen � Iron Maiden , �� � , �� �� ��몠 ���孮��﫠 ��� �� ����ᠭ�� �⮩ 㦠᭮� �ணࠬ�� ! (C) 1998 , SOL & MOL records . " _

L = LEN(a$)
FOR N = 30 TO L
FOR P = 1 TO 600: NEXT P
S$ = MID$(a$, N, 40)
LOCATE 13, 1: PRINT S$
IF N > 453 THEN SLEEP
NEXT N

