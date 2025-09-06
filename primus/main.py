def to_readable(x):
    return 'ABCD'[x]
input_ = '000000111111222222333333444444555555012345123450234501345012450123501234000001111122222333334444455555543210'
output = [ 0, 2, 1, 1, 1, 1, 1, 0, 0, 2, 1, 3, 1, 0, 1, 0, 1, 0, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 0, 3, 3, 1, 2, 1, 0, 0, 0, 1, 1, 2, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 3, 1, 2, 1, 0, 3, 3, 3, 1, 3, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 2, 1, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 2, 1, 2, 2, 0, 1, 3, 1 ]
output = [to_readable(x) for x in output]

n = len(input_)

assert(len(input_) + 1 == len(output))

# for i, each in enumerate(zip(input_, output)):
#     print( '- ', ' => '.join(each))
#     if i % 6 == 0:
#         print()

for i in range(n):
    if i % 6 == 0:
        print()
    start = output[i]
    end = output[i + 1]
    door = input_[i]
    print(f'{start}x{door} - {end}')
