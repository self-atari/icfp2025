def to_readable(x):
    return 'ABCD'[x]
in1 = '_000111222333444555012345123450234501345012450123501234'
out1 = [ 0, 1, 2, 0, 2, 1, 0, 0, 0, 0, 1, 0, 1, 2, 2, 2, 0, 1, 2, 0, 2, 1, 0, 2, 0, 2, 1, 0, 2, 0, 1, 0, 1, 2, 0, 1, 0, 1, 2, 0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 2, 0, 2, 1, 0, 2 ]
out1 = [to_readable(x) for x in out1]

assert(len(in1) == len(out1))

for i, each in enumerate(zip(in1, out1)):
    print( '- ', ' => '.join(each))
    if i % 6 == 0:
        print()
